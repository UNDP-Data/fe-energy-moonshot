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
        content: t('feedback-sent'),
        duration: 5,
        className: 'undp-message',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: t('feedback-error'),
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
        {t('feedback-title')}
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
              rules={[{ required: true, message: t('feedback-name-required') }]}
            >
              <Input
                className='undp-input'
                placeholder={t('feedback-name-placeholder')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <p className='undp-typography label'>{t('office')}</p>
            <Form.Item<FieldType>
              name='office'
              rules={[{ required: true, message: t('feedback-office-required') }]}
            >
              <Input
                className='undp-input'
                placeholder={t('feedback-office-placeholder')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <p className='undp-typography label'>{t('email')}</p>
            <Form.Item<FieldType>
              name='email'
              rules={[{ required: true, type: 'email', message: t('feedback-email-required') }]}
            >
              <Input
                className='undp-input'
                placeholder={t('feedback-email-placeholder')}
              />
            </Form.Item>
          </Col>
        </Row>
        <p className='undp-typography label'>{t('message')}</p>
        <Form.Item<FieldType>
          name='message'
          rules={[{ required: true, message: t('feedback-message-required') }]}
        >
          <Input.TextArea
            className='undp-input'
            placeholder={t('feedback-message-placeholder')}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 16 }}>
          <div className='flex-div flex-vert-align-center'>
            <button
              className='undp-button button-secondary'
              type='submit'
            >
              {t('submit')}
            </button>
            {loadingMessage ? <Spin /> : ''}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};
