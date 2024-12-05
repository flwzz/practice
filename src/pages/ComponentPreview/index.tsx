import { PageContainer } from "@ant-design/pro-components";
import styles from './index.less';
import TemplateTextArea from "@/components/TemplateTextArea";
const ComponentPreview: React.FC = () => {
  return (
    <PageContainer ghost header={{title: '组件展示'}}>
      <div className={styles.container}>
        <TemplateTextArea autoSize />
      </div>
    </PageContainer>
  );
};

export default ComponentPreview;