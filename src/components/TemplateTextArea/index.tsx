import { useCreation, useMemoizedFn, useThrottleFn } from 'ahooks';
import clsx from 'clsx';
import { throttle } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.less';
import { ReactComponent as Resizer } from './resizer.svg';
export interface VariableOption {
  label: React.ReactNode;
  value: string;
  html?: string;
  key: string;
}

export interface TemplateTextAreaProps {
  /** plain text, no html tag inside */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  defaultHeight?: number;
  autoSize?: boolean;
  options?: VariableOption[];
}

const customElementTag = 'custom-element';

const convertHtmlToPlainText = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.querySelectorAll(customElementTag).forEach((el) => {
    const value = el.getAttribute('data-value');
    el.replaceWith(value ? `\${${value}}` : '');
  });
  return tempDiv.textContent || tempDiv.innerText || '';
};

const createVariableElement = (option: VariableOption) => {
  const node = document.createElement(customElementTag);
  node.setAttribute('data-value', option.value);
  node.setAttribute('data-key', option.key);
  node.setAttribute('contenteditable', 'false');
  node.setAttribute(
    'style',
    `padding: 2px 4px; background-color: pink; margin: 0 2px; border-radius: 4px; font-size: 10px; color: green; `,
  );
  node.innerHTML = option.html || option.value;
  return node;
};

const insertNode = (range: Range, node: Node) => {
  const selection = window.getSelection();
  range.setStart(range.endContainer, range.endOffset - 1);
  range.deleteContents();
  range.insertNode(node);
  selection?.removeAllRanges();
  selection?.addRange(range);
  range.collapse(false);
};

const convertPlainTextToHtml = (
  text: string,
  options: VariableOption[],
): string => {
  const str = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\$\{([^}]*)}/g, (match, p1: string) => {
      const option = options.find((item) => item.value === p1);
      if (option) {
        return createVariableElement(option).outerHTML;
      }
      return `${p1}`;
    });
  return str !== '&lt;br&gt;' ? str : '';
};

const TemplateTextArea: React.FC<TemplateTextAreaProps> = (props) => {
  const {
    value,
    onChange,
    disabled,
    placeholder,
    className,
    style,
    width = '100%',
    defaultHeight = 300,
    autoSize,
    options,
  } = props;

  const textAreaRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(defaultHeight);
  const [key, setKey] = React.useState<string | null>(null);
  const [range, setRange] = useState<Range>();

  const variableOptionMap = useCreation(() => {
    const map = new Map<string, VariableOption[]>();
    options?.reduce((acc, item) => {
      if (!acc.has(item.key)) {
        acc.set(item.key, [item]);
      } else {
        acc.get(item.key)?.push(item);
      }
      return acc;
    }, map);
    return map;
  }, [options]);

  const { run: onInput } = useThrottleFn(
    (e: React.FormEvent<HTMLDivElement>) => {
      let html = (e.target as HTMLDivElement).innerHTML;
      if (html === '<br>') {
        html = '';
        // 重现placeholder
        (e.target as HTMLDivElement).innerHTML = '';
      }
      onChange?.(html ? convertHtmlToPlainText(html) : '');
    },
    { wait: 50 },
  );

  const onKeyDown = useMemoizedFn((e: KeyboardEvent) => {
    // 光标在变量内，不触发快捷键
    if (
      range &&
      (range.commonAncestorContainer as Element).nodeType === Node.TEXT_NODE //这个可以不要
    ) {
      let parent = range.commonAncestorContainer.parentElement;
      while (parent && parent !== textAreaRef.current) {
        if (parent.tagName === customElementTag.toLocaleUpperCase()) {
          return;
        }
        parent = parent.parentElement;
      }
    }
    if (variableOptionMap.has(e.key)) {
      if (e.key !== key) {
        setKey(e.key);
      }
    } else {
      setKey(null);
    }
  });

  const usableOptions = useMemo(() => {
    return key ? variableOptionMap.get(key) : [];
  }, [key]);

  const onSelectionChange = useMemoizedFn(() => {
    const selection = window.getSelection();
    if (selection)
      setRange(selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined);
  });

  const onFocus = useMemoizedFn(() => {
    if (variableOptionMap.size) {
      document.addEventListener('keydown', onKeyDown);
    }
    document.addEventListener('selectionchange', onSelectionChange);
  });

  const onBlur = useMemoizedFn(() => {
    if (variableOptionMap.size) {
      document.removeEventListener('keydown', onKeyDown);
    }
    document.removeEventListener('selectionchange', onSelectionChange);
  });

  const onMouseDown = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>) => {
    const y = e.clientY;

    if (textAreaRef.current) {
      const h = textAreaRef.current.offsetHeight || 0;
      document.documentElement.style.cursor = 'ns-resize';
      const onMouseMove = throttle((e: MouseEvent) => {
        setHeight(Math.max(h + e.clientY - y, defaultHeight));
      }, 10);

      const onMouseUp = () => {
        document.documentElement.style.cursor = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  const inputVariable = useMemoizedFn((option: VariableOption) => {
    if (range) {
      insertNode(range, createVariableElement(option));
      onChange?.(convertHtmlToPlainText(textAreaRef.current!.innerHTML));
    }
    setKey(null);
  });

  const position = useCreation(() => {
    const rect = range?.getBoundingClientRect();
    return rect ? { top: rect.top + 18, left: rect.left } : undefined;
  }, [range]);

  useEffect(() => {
    if (textAreaRef.current && value)
      textAreaRef.current.innerHTML = convertPlainTextToHtml(
        value,
        options || [],
      );
  }, []);

  return (
    <div
      className={clsx(styles['template-textarea-wrapper'], className)}
      style={{ ...style, height, width }}
    >
      <div
        placeholder={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        className={styles['template-textarea']}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={textAreaRef}
      />
      {autoSize && (
        <div className={styles['resize-handler']} onMouseDown={onMouseDown}>
          <Resizer className={styles['resize-handler-icon']} />
        </div>
      )}
      {key && (
        <div className={styles['variable-dropdown']} style={{ ...position }}>
          <ul className={styles['variable-list']}>
            {usableOptions?.map((item) => {
              return (
                <li
                  className={styles['variable-list-item']}
                  key={`${item.key}/${item.value}`}
                  onClick={() => inputVariable(item)}
                >
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TemplateTextArea;
