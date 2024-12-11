import { PageContainer } from "@ant-design/pro-components";
import styles from './index.less';
import TemplateTextArea, { VariableOption } from "@/components/TemplateTextArea";
import { useState } from "react";

const variableTemplates: VariableOption[] = [
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
const ComponentPreview: React.FC = () => {
  const [text, setText] = useState<string>('')

  return (
    <PageContainer ghost header={{title: '组件展示'}}>
      <div className={styles.container}>
        <TemplateTextArea
          autoSize
          placeholder="placeholder~"
          options={variableTemplates}
          value={text}
          onChange={setText}
        />

        <p>{ text}</p>
      </div>
    </PageContainer>
  );
};

export default ComponentPreview;