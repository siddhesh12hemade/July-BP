import { Modal } from 'antd';

const ModalUI = (props: any): JSX.Element => {
  
  const { open = false, updateOpen = () => {}, headerTitle = '', onSubmit = () => {}, submitText='' } = props || {}

  const handleCancel = () => {
    updateOpen(false);
  };

  return (
    <>
      <Modal title={headerTitle} open={open} 
    footer={null}
    onCancel={handleCancel} 
      >
       {props.children}
      </Modal>
    </>
  );
};

export default ModalUI;