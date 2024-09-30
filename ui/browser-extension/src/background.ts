import { TrustAssemblyMessage } from './utils/messagePassing';
import { getBackendUrlFromEnvironmentAndVersion } from './utils/constants';
// TODO: make this dynamic based on which environment we're in, for now it's
// hardcoded to only work locally
import { CONFIG } from '../configs/config.local';

console.log(
  'Trust Assembly Headline Transformer background service worker loaded.',
);

/**
 * Listens for messages sent to the background service worker and handles the
 * 'FETCH_TRANSFORMED_HEADLINE' action by making a request to the backend to
 * transform the provided headline text.
 *
 * @param message - An object containing the TrustAssemblyMessage and the original text to be transformed.
 * @param _sender - Unused parameter representing the sender of the message.
 * @param sendResponse - A function to send the transformed text back to the caller.
 * @returns True to indicate that the response will be sent asynchronously.
 */
chrome.runtime.onMessage.addListener(
  async (
    message: { action: TrustAssemblyMessage; originalText: string },
    _sender,
    sendResponse,
  ): Promise<boolean | undefined> => {
    if (message.action === TrustAssemblyMessage.FETCH_TRANSFORMED_HEADLINE) {
      const originalText = message.originalText;
      console.log('inside of chrome.runtime.onMessage.addListener');

      // Make the API request to your backend
      const url = `${getBackendUrlFromEnvironmentAndVersion(CONFIG.BACKEND_URL, CONFIG.API_VERSION)}/headline`;
      console.log(`background script fetching URL: ${url}`);
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headline: originalText }),
      })
        .then((response) => response.json())
        .then((data: { transformedText: string }) => {
          console.log(
            `background::sendResponse: ${JSON.stringify(data, null, 2)}`,
          );
          sendResponse(data);
        })
        .catch((error) => {
          console.error('Error fetching transformed headline:', error);
          sendResponse({ transformedText: null });
        });

      // Return true to indicate that sendResponse will be called asynchronously
      return true;
    } else {
      throw new Error(`Unknown message type: ${message.action}`);
    }
  },
);
