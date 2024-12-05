import { useMemoizedFn, useThrottleFn } from 'ahooks';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import styles from './index.less';
import { ReactComponent as Resizer } from './resizer.svg';

interface QuickSelectOption {
  label: React.ReactNode;
  value: string;
  html?: React.ReactNode;
  key: string;
}

const templates: QuickSelectOption[] = [
  {
    label: '姓名',
    value: 'name',
    html: '姓名',
    key: '/',
  },
  {
    label: '年龄',
    value: 'age',
    html: '年龄',
    key: '/',
  },
  {
    label: '性别',
    value: 'gender',
    html: '性别',
    key: '/',
  },
  {
    label: '地址',
    value: 'address',
    html: '地址',
    key: '/',
  },
  {
    label: '张三',
    value: '张三',
    html: '@ 张三',
    key: '@',
  },
  {
    label: '李四',
    value: '李四',
    html: '@ 李四',
    key: '@',
  },
  {
    label: '王五',
    value: '王五',
    html: '@ 王五',
    key: '@',
  },
];

interface TemplateTextAreaProps {
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
  quickSelectOption?: QuickSelectOption[];
}
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
    quickSelectOption
  } = props;

  const [visible, setVisible] = React.useState(false);

  const quickSelectOptionMap = useMemo(() => {
    return new Map()
  }, [quickSelectOption]);

  const { run: onInput } = useThrottleFn(
    (e: React.FormEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      onChange?.(target.innerText);
      console.log('onInput', target.innerText);
    },
    { wait: 50 },
  );

  const onKeyDown = useMemoizedFn((e: KeyboardEvent) => {
    e.key === 'Enter';
  });

  const onFocus = useMemoizedFn(() => {
    document.addEventListener('keydown', (e) => {});
  });

  const onBlur = useMemoizedFn(() => {
    document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      placeholder={placeholder}
      contentEditable={!disabled}
      suppressContentEditableWarning={true}
      className={clsx(styles['template-textarea'], className)}
      style={{ ...style, height: defaultHeight, width }}
      onInput={onInput}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {autoSize && (
        <div className={styles['resize-handler']}>
          <Resizer className={styles['resize-handler-icon']} />
        </div>
      )}
    </div>
  );
};

export default TemplateTextArea;
