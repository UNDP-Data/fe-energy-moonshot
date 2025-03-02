import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'd3-format';
import {
  Modal, Form, Input, message,
} from 'antd';
import { ProjectLevelDataType } from '../Types';
import { EditableCell } from '../Components/EditableCell';
import { addProposedEdit } from '../firebase';

interface TableProps {
  countryLinkDict: any;
  projects: ProjectLevelDataType[];
}

interface ProjectProps {
  countryLinkDict: any;
  project: ProjectLevelDataType;
}

type FieldType = {
  name: string;
  office: string;
  position: string;
};

const Project = (props:ProjectProps) => {
  const {
    project,
    countryLinkDict,
  } = props;

  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const userRef = useRef(userData);
  const modalRef = useRef(modalOpen);

  const hideModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    userRef.current = userData;
    modalRef.current = modalOpen;
  }, [modalOpen, userData]);

  function requestUserData() {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (userRef.current) {
          clearInterval(interval);
          resolve();
        }
        if (!modalRef.current) {
          clearInterval(interval);
          reject();
        }
      }, 300);
    });
  }

  async function sendUpdate(value:string, fieldName:string, outputId?:string) {
    if (!userRef.current) {
      setModalOpen(true);
      await requestUserData();
    }
    if (userRef.current) {
      await addProposedEdit({
        fieldName,
        value,
        date: new Date().toUTCString(),
        outputId,
        ...userRef.current as FieldType,
        projectId: project.id,
      });

      messageApi.open({
        type: 'success',
        content: 'Update sent',
        duration: 5,
        className: 'undp-message',
      });
    }
  }

  const sendUpdateCallback = useCallback(sendUpdate, []);

  return (
    <>
      {
        contextHolder
      }
      <div className='undp-table-row'>
        <div style={{ width: '30%', background: 'transparent' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <h6 className='undp-typography'>
              {
                (project.title) && (
                  <EditableCell
                    text={project.title}
                    fieldName='title'
                    sendUpdate={sendUpdateCallback}
                  />
                )
              }
              {' - '}
              <EditableCell
                text={project.id ? project.id : '__'}
                fieldName='id'
                sendUpdate={sendUpdateCallback}
              />
              {project.genderMarker && ' - '}
              {
                (project.genderMarker) && (
                  <EditableCell
                    text={project.genderMarker}
                    fieldName='genderMarker'
                    sendUpdate={sendUpdateCallback}
                  />
                )
              }
            </h6>
            <p className='undp-typography'>
              {
                (project.description) && (
                  <EditableCell
                    text={project.description}
                    fieldName='description'
                    sendUpdate={sendUpdateCallback}
                  />
                )
              }
            </p>
          </div>
        </div>
        <div style={{ width: '20%', background: 'transparent' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <p className='undp-typography'>
              {t('country')}
              {' - '}
              <b>
                {
                  countryLinkDict[project.countryCode]
                    ? (
                      <a
                        href={countryLinkDict[project.countryCode]}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {project.countryName}
                      </a>
                    )
                    : (project.countryName)
                }
              </b>
            </p>
            <p className='undp-typography'>
              {t('budget')}
              {' - '}
              <EditableCell
                text={project.budget ? Math.abs(project.budget) < 1 ? project.budget && project.budget.toString() : format('~s')(project.budget).replace('G', 'B') : '__'}
                fieldName='budget'
                sendUpdate={sendUpdateCallback}
              />
            </p>
            <p className='undp-typography'>
              {
                (project.verticalFunded) && (
                  <>
                    {t('type')}
                    {' - '}
                    <EditableCell
                      text={t(project.verticalFunded ? 'vf' : 'non-vf')}
                      fieldName='verticalFunded'
                      sendUpdate={sendUpdateCallback}
                    />
                  </>
                )
              }
            </p>
            <p className='undp-typography'>
              {
                (project.genderMarker) && (
                  <>
                    {t('gender-equality')}
                    {' - '}
                    <EditableCell
                      text={project.genderMarker}
                      fieldName='genderMarker'
                      sendUpdate={sendUpdateCallback}
                    />
                  </>
                )
              }
            </p>

            <p className='undp-typography'>
              {t('ghg-emissions-reduction')}
              {' - '}
              <EditableCell
                text={project.ghgEmissions === null ? '__' : `${project.ghgEmissions}M ${t('tonnes')}`}
                fieldName='ghgEmissions'
                sendUpdate={sendUpdateCallback}
              />
            </p>
            <p className='undp-typography'>
              {
                (project.link) ? (
                  <a
                    href={project.link}
                    target='_blank'
                    rel='noreferrer'
                  >
                    Link
                  </a>
                ) : (
                  <>
                    {'Link - '}
                    <EditableCell
                      text='__'
                      fieldName='link'
                      sendUpdate={sendUpdateCallback}
                    />
                  </>
                )
              }
            </p>
            <p className='undp-typography'>
              {'Donors - '}
              <EditableCell
                text={project.donors === null ? '__' : project.donors.join(', ')}
                fieldName='donors'
                sendUpdate={sendUpdateCallback}
              />
            </p>
          </div>
        </div>
        <div style={{ width: '50%', background: 'transparent' }} className='undp-table-row-cell'>
          {
            project.outputs.map((o, i) => (
              <div key={`${i}output`} className='flex-div'>
                <div
                  style={{ width: '40%', background: 'transparent' }}
                  className={`undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`}
                >
                  <p className='undp-typography'>
                    {
                      (o.directBeneficiaries) ? (
                        <>
                          {t('direct-beneficiaries')}
                          {' - '}
                        </>
                      ) : (
                        ''
                      )
                    }
                    <EditableCell
                      text={o.directBeneficiaries ? format('~s')(o.directBeneficiaries).replace('G', 'B') : 'Indirect beneficiaries'}
                      fieldName='beneficiaries'
                      outputId={o.id}
                      sendUpdate={sendUpdateCallback}
                    />
                  </p>
                  <p className='undp-typography'>
                    {
                      (o.outputCategory) && (
                        <>
                          {t('select-output-type')}
                          {' - '}
                          <EditableCell
                            text={o.outputCategory}
                            outputId={o.id}
                            fieldName='outputCategory'
                            sendUpdate={sendUpdateCallback}
                          />
                        </>
                      )
                    }
                  </p>
                  <p className='undp-typography'>
                    {
                      (o.beneficiaryCategory) && (
                        <>
                          {t('select-output-sub-type')}
                          {' - '}
                          <EditableCell
                            text={o.beneficiaryCategory}
                            outputId={o.id}
                            fieldName='beneficiaryCategory'
                            sendUpdate={sendUpdateCallback}
                          />
                        </>
                      )
                    }
                  </p>
                  <p className='undp-typography'>
                    {t('female-percent')}
                    {' - '}
                    <EditableCell
                      text={o.percentFemale === null ? '__' : `${format('.2f')(o.percentFemale)}%`}
                      fieldName='percentFemale'
                      outputId={o.id}
                      sendUpdate={sendUpdateCallback}
                    />
                  </p>
                  <p className='undp-typography'>
                    {
                      (o.energySaved) ? (
                        <>
                          {t('energy-saved-mj')}
                          {' - '}
                          <EditableCell
                            text={format('~s')(o.energySaved).replace('G', 'B')}
                            outputId={o.id}
                            fieldName='energySaved'
                            sendUpdate={sendUpdateCallback}
                          />
                        </>
                      ) : ('')
                    }
                  </p>
                </div>
                <div
                  style={{ width: '60%', background: 'transparent' }}
                  className={
                    `undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`
                  }
                >
                  {
                    (o.description) && (
                      <>
                        <EditableCell
                          text={o.description}
                          outputId={o.id}
                          fieldName='description'
                          sendUpdate={sendUpdateCallback}
                        />
                      </>
                    )
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <Modal
        open={modalOpen}
        className='undp-modal'
        title='Identify yourself to propose edits'
        onCancel={hideModal}
        onOk={hideModal}
      >
        <div>
          <Form
            name='userData'
            onFinish={(e) => { setUserData(e); hideModal(); }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: true }}
            autoComplete='off'
          >

            <p className='undp-typography label'>Name</p>
            <Form.Item<FieldType>
              name='name'
              rules={[{ required: true, message: 'Please input your name' }]}
            >
              <Input
                className='undp-input'
                placeholder='Please input your name'
              />
            </Form.Item>

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
            <p className='undp-typography label'>Position</p>
            <Form.Item<FieldType>
              name='position'
              rules={[{ required: true, message: 'Please input your position' }]}
            >
              <Input
                className='undp-input'
                placeholder='Please input your position'
              />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 16 }}>
              <button
                className='undp-button button-secondary'
                type='submit'
              >
                Submit
              </button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export const DataTable = (props: TableProps) => {
  const {
    projects,
    countryLinkDict,
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <div className='undp-scrollbar' style={{ height: '40rem' }}>
        <div className='undp-table-head undp-table-head-sticky'>
          <div style={{ width: '30%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('project-title-and-description')}
            </div>
          </div>
          <div style={{ width: '20%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('project-info')}
            </div>
          </div>
          <div style={{ width: '20%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('output-beneficiaries')}
            </div>
          </div>
          <div style={{ width: '30%' }} className='undp-table-head-cell undp-sticky-head-column'>
            <div className='padding-left-05 padding-right-05'>
              {t('output-description')}
            </div>
          </div>
        </div>
        {
          projects.map((project, i) => (<Project key={`${i}project`} countryLinkDict={countryLinkDict} project={project} />))
        }
      </div>
    </>
  );
};
