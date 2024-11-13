import { extractFromHtml } from '@extractus/article-extractor';
import { dummyGetTransformation } from './api/dummyApi';
import { Article } from './models/Article';
import { MessagePayload } from './models/MessagePayload';
import { TransformedArticle } from './models/TransformedArticle';
import ArticleStateManager from './utils/ArticleStateManager';
import { TrustAssemblyMessage } from './utils/messagePassing';

console.log('Trust Assembly Headline Transformer content script loaded.');

function getElementByXpath(xp: string) {
  return document.evaluate(
    xp,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
}

async function findHeadlineElement() {
  const parsedArticle = await extractFromHtml(
    document.documentElement.innerHTML,
  );

  if (!parsedArticle) {
    console.log('No article data received');
    return;
  }

  console.log('parsedArticle:', parsedArticle);
  const headlineElement =
    getElementByXpath(`//h1[contains(., "${parsedArticle.title}")]`) ??
    undefined;

  return headlineElement as HTMLElement | undefined;
}

const requestTransformedHeadline = async (
  article: Article,
): Promise<TransformedArticle> => {
  // just use the dummy API for now
  return await dummyGetTransformation(article);

  // TODO: uncomment this code below so that we actually communite with the backend
  // rather than just returning the original text uppercase. Right now @melvillian
  // commented this out to make the PR easier to work with; the plan is to
  // add backend communication to the extension and then uncomment this code.

  // const response = await chrome.runtime.sendMessage<
  //   MessagePayload,
  //   TransformedArticle | undefined
  // >({
  //   action: TrustAssemblyMessage.FETCH_TRANSFORMED_HEADLINE,
  //   article,
  // });
  // console.log('chrome.runtime.sendMessage');
  // console.log(`response: ${response}`);
  // if (chrome.runtime.lastError) {
  //   console.error(chrome.runtime.lastError);
  //   throw new Error(chrome.runtime.lastError.message);
  // } else if (response && response.transformedText) {
  //   console.log('resolve(response);');
  //   return response;
  // } else {
  //   throw new Error('No transformed text received');
  // }
};

const stateManager = new ArticleStateManager(requestTransformedHeadline);

(async function () {
  const elementToModify = await findHeadlineElement();
  if (!elementToModify) return;

  await stateManager.setElement(elementToModify);

  elementToModify.addEventListener('click', () =>
    stateManager.toggleModification(),
  );

  chrome.runtime.onMessage.addListener(
    async (message: MessagePayload): Promise<boolean | undefined> => {
      console.log('Got message:', message);

      if (message.action === TrustAssemblyMessage.TOGGLE_MODIFICATION) {
        stateManager.toggleModification();
        return false;
      }
    },
  );

  stateManager.toggleModification();
})();
