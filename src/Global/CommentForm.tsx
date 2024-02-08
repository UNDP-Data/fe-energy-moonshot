import { useState } from 'react';
import {
  Form, Input, Row, Col, Spin, message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { createNewComment } from '../firebase';

type FieldType = {
  name: string;
  office: string;
  email: string;
  message: string;
};

export const CommentForm = () => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [loadingMessage, setLoadingMessage] = useState(false);

  async function submitForm(e:FieldType) {
    setLoadingMessage(true);
    try {
      await createNewComment({
        date: new Date().toUTCString(),
        ...e,
      });
      messageApi.open({
        type: 'success',
        content: 'Feedback sent',
        duration: 5,
        className: 'undp-message',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'An error occuried, please try again later.',
        duration: 5,
        className: 'undp-message',
      });
    }
    setLoadingMessage(false);
  }

  return (
    <div>
      {contextHolder}
      <h4>
        Give your feedback
      </h4>
      <Form
        name='userData'
        onFinish={(e) => { submitForm(e); }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        autoComplete='off'
      >
        <Row gutter={24}>
          <Col span={8}>
            <p className='undp-typography label'>{t('name')}</p>
            <Form.Item<FieldType>
              name='name'
              rules={[{ required: true, message: 'Please input your name' }]}
            >
              <Input
                className='undp-input'
                placeholder='Please input your name'
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <p className='undp-typography label'>Office</p>
            <Form.Item<FieldType>
              name='office'
              rules={[{ required: true, message: 'Please input your office name' }]}
            >
              <Input
                className='undp-input'
                placeholder='Please input your office name'
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <p className='undp-typography label'>Email</p>
            <Form.Item<FieldType>
              name='email'
              rules={[{ required: true, type: 'email', message: 'Please input your email' }]}
            >
              <Input
                className='undp-input'
                placeholder='Please input your position'
              />
            </Form.Item>
          </Col>
        </Row>
        <p className='undp-typography label'>Message</p>
        <Form.Item<FieldType>
          name='message'
          rules={[{ required: true, message: 'Please input your position' }]}
        >
          <Input.TextArea
            className='undp-input'
            placeholder='Please input your message'
          />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 16 }}>
          <div className='flex-div flex-vert-align-center'>
            <button
              className='undp-button button-secondary'
              type='submit'
            >
              Submit
            </button>
            {loadingMessage ? <Spin /> : ''}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};
