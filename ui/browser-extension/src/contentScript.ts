import { TrustAssemblyMessage } from './utils/messagePassing';

console.log('Trust Assembly Headline Transformer content script loaded.');

interface TransformResponse {
  transformedText: string;
}

// Function to replace the headline text
const replaceHeadline = (
  element: HTMLElement,
  transformedText: string,
): void => {
  console.log('Replacing headline text: ', transformedText);
  const originalText = element.textContent || '';
  element.setAttribute('data-original-text', originalText);

  // Replace the text content with the transformed text
  element.textContent = transformedText;

  console.log(`element.style.color: ${element.style.color}`);
  console.log(`element.style.fontStyle: ${element.style.fontStyle}`);
  // Optionally, add styling to make it distinguishable
  element.setAttribute('data-original-color', element.style.color);
  element.style.color = 'blue';
  element.setAttribute('data-original-fontStyle', element.style.fontStyle);
  element.style.fontStyle = 'italic';

  // Add an event listener to toggle back to the original text
  element.addEventListener('click', () => {
    const currentText = element.textContent;
    const storedOriginalText = element.getAttribute('data-original-text');
    if (currentText === transformedText && storedOriginalText) {
      element.textContent = storedOriginalText;
      element.style.color = element.getAttribute('data-original-color') || '';
      element.style.fontStyle =
        element.getAttribute('data-original-fontStyle') || '';
    } else {
      element.textContent = transformedText;
      element.style.color = 'blue';
      element.style.fontStyle = 'italic';
    }
  });
};

// Function to request the transformed headline
const requestTransformedHeadline = async (
  originalText: string,
): Promise<TransformResponse> => {
  return new Promise((resolve) => {
    resolve({ transformedText: originalText.toUpperCase() });
  });

  // TODO: uncomment this code below so that we actually communite with the backend
  // rather than just returning the original text uppercase. Right now @melvillian
  // commented this out to make the PR easier to work with; the plan is to
  // add backend communication to the extension and then uncomment this code.

  // const response = await chrome.runtime.sendMessage({
  //   action: TrustAssemblyMessage.FETCH_TRANSFORMED_HEADLINE,
  //   originalText,
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

const findHeadlineElement = (): HTMLElement | null => {
  const selectors = [
    'h1.main-headline',
    'h1.article-title',
    'h1.headline',
    'h1.detailHeadline',
    'h1[class*="headline"]', // Catch-all selector for any class containing the text "headline"
  ];
  console.log(
    `Searching for headline element using these selectors: ${selectors.join(', ')}`,
  );

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element as HTMLElement;
    }
  }
  return null;
};

// Main function to execute the transformation
async function transformHeadline(): Promise<void> {
  console.log('Starting headline transformation...');
  const headlineElement = findHeadlineElement();

  if (headlineElement) {
    console.log('Found headline element:', headlineElement);
    const originalText = headlineElement.textContent || '';

    try {
      const response = await requestTransformedHeadline(originalText);
      console.log('Received requestTransformedHeadline response:', response);
      replaceHeadline(headlineElement, response.transformedText);
    } catch (error) {
      console.error('Error transforming headline:', error);
    }
  } else {
    console.log('Headline element not found on this page.');
  }
}

// Execute the transformation when the content script is loaded
transformHeadline();
