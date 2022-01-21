import { mdiCloseThick } from '@mdi/js';

export function isValidRegex(regexStr: string): boolean {
  try {
    return Boolean(new RegExp(regexStr));
  } catch (e) {
    return false;
  }
}

export function nodeIsElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

export interface LtlButtonParams {
  text: string;
  callback: () => void;
  icon: string;
  shift: boolean;
}

export function ltlButtonParams(text: string, callback: () => void, icon: string, shift = false): LtlButtonParams {
  return { text, callback, icon, shift };
}

function createLtlButton({ text, callback, icon, shift }: LtlButtonParams): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'ltl-button';
  b.innerText = text;
  b.addEventListener('click', callback);
  const svg = document.createElement('svg');
  b.appendChild(svg);
  svg.outerHTML = `
    <svg viewBox="0 0 24 24" class="ltl-svg ${shift ? 'ltl-shifted-svg' : ''}">
      <path d="${icon}" fill="white"></path>
    </svg>
  `;
  return b;
}

export function injectLtlLauncher(target: HTMLElement, buttons: Array<LtlButtonParams | ((ltlWrapper: HTMLDivElement) => LtlButtonParams)>): void {
  if (document.getElementById('ltl-wrapper') != null) {
    console.error('LTL launcher already injected');
    return;
  }

  const style = document.createElement('style');
  style.innerText = `
    #ltl-wrapper {
      display: flex;
      flex-direction: row;
    }
    .ltl-button {
      flex-grow: 1;
      background-color: #0099ffb5;
      color: white;
      padding: 3px;
      transition: background-color 50ms linear;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ltl-button:hover {
      background-color: #0099ffa0;
    }
    .ltl-svg {
      height: 15px;
      vertical-align: middle;
      margin: 0px 5px;
    }
    .ltl-shifted-svg {
      /* transform: translateY(-1px); */
    }
  `;
  document.body.appendChild(style);

  const ltlWrapper = document.createElement('div');
  ltlWrapper.id = 'ltl-wrapper';

  buttons.forEach((button) => {
    if (typeof button === 'function') {
      button = button(ltlWrapper);
    }
    ltlWrapper.appendChild(createLtlButton(button));
  });

  const hideButton = createLtlButton(ltlButtonParams('', () => (ltlWrapper.style.display = 'none'), mdiCloseThick));
  hideButton.style.flexGrow = '0';
  ltlWrapper.appendChild(hideButton);

  target.appendChild(ltlWrapper);
}
