import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'd3-format';
import { Modal, Form, Input } from 'antd';
import { ProjectLevelDataType } from '../Types';
import { EditableCell } from '../Components/EditableCell';
import { addProposedEdit } from '../firebase';

interface TableProps {
  projects: ProjectLevelDataType[];
}

interface ProjectProps {
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
  } = props;

  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

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
      addProposedEdit({
        fieldName,
        value,
        date: new Date().toGMTString(),
        outputId,
        ...userRef.current as FieldType,
        projectId: project.id,
      });
    }
  }

  const sendUpdateCallback = useCallback(sendUpdate, []);

  return (
    <>
      <div className='undp-table-row'>
        <div style={{ width: '30%' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <h6 className='undp-typography'>
              <EditableCell
                text={project.title}
                fieldName='title'
                sendUpdate={sendUpdateCallback}
              />
              {' - '}
              {project.id}
              {' - '}
              <EditableCell
                text={project.genderMarker}
                fieldName='genderMarker'
                sendUpdate={sendUpdateCallback}
              />
            </h6>
            <p className='undp-typography'>
              <EditableCell
                text={project.description}
                fieldName='description'
                sendUpdate={sendUpdateCallback}
              />
            </p>
          </div>
        </div>
        <div style={{ width: '20%' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <p className='undp-typography'>
              {t('country')}
              {' - '}
              <b>{project.countryName}</b>
            </p>
            <p className='undp-typography'>
              {t('budget')}
              {' - '}
              <b>
                <EditableCell
                  text={Math.abs(project.budget) < 1 ? project.budget && project.budget.toString() : format('~s')(project.budget).replace('G', 'B')}
                  fieldName='budget'
                  sendUpdate={sendUpdateCallback}
                />
              </b>
            </p>
            <p className='undp-typography'>
              {t('type')}
              {' - '}
              <b>
                <EditableCell
                  text={t(project.verticalFunded ? 'vf' : 'non-vf')}
                  fieldName='verticalFunded'
                  sendUpdate={sendUpdateCallback}
                />
              </b>
            </p>
            <p className='undp-typography'>
              {t('gender-equality')}
              {' - '}
              <b>
                <EditableCell
                  text={project.genderMarker === null ? `${project.genderMarker}` : 'N/A'}
                  fieldName='genderMarker'
                  sendUpdate={sendUpdateCallback}
                />
              </b>
            </p>
            <p className='undp-typography'>
              {t('ghg-emissions-reduction')}
              {' - '}
              <b>
                <EditableCell
                  text={project.ghgEmissions === null ? `${project.ghgEmissions}M ${t('tonnes')}` : 'N/A'}
                  fieldName='ghgEmissions'
                  sendUpdate={sendUpdateCallback}
                />
              </b>
            </p>
          </div>
        </div>
        <div style={{ width: '50%' }} className='undp-table-row-cell'>
          {
            project.outputs.map((o, i) => (
              <div key={`${i}output`} className='flex-div'>
                <div
                  style={{ width: '40%' }}
                  className={`undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`}
                >
                  <p className='undp-typography'>
                    { o.directBeneficiaries !== 0 ? (
                      <p className='undp-typography'>
                        {t('direct-beneficiaries')}
                        {' - '}
                        <b>
                          <EditableCell
                            text={format('~s')(o.directBeneficiaries).replace('G', 'B')}
                            fieldName='beneficiaries'
                            outputId={o.id}
                            sendUpdate={sendUpdateCallback}
                          />
                        </b>
                      </p>
                    ) : (
                      <p className='undp-typography'>
                        <b>
                          <EditableCell
                            text={t('indirect-beneficiaries')}
                            fieldName='beneficiaries'
                            outputId={o.id}
                            sendUpdate={sendUpdateCallback}
                          />
                        </b>
                      </p>
                    )}
                    <p className='undp-typography'>
                      {t('select-output-type')}
                      {' - '}
                      <b>
                        <EditableCell
                          text={o.outputCategory}
                          fieldName='beneficiaries'
                          outputId={o.id}
                          sendUpdate={sendUpdateCallback}
                        />
                      </b>
                    </p>
                    <p className='undp-typography'>
                      {t('select-output-sub-type')}
                      {' - '}
                      <b>
                        <EditableCell
                          text={o.beneficiaryCategory}
                          fieldName='beneficiaries'
                          outputId={o.id}
                          sendUpdate={sendUpdateCallback}
                        />
                      </b>
                    </p>
                    <p className='undp-typography'>
                      {t('female-percent')}
                      {' - '}
                      <b>
                        <EditableCell
                          text={
                            o.percentFemale === null ? 'N/A'
                              : `${!(o.percentFemale % 1) ? (o.percentFemale) : format(',.2f')(o.percentFemale)}%`
                          }
                          fieldName='percentFemale'
                          outputId={o.id}
                          sendUpdate={sendUpdateCallback}
                        />
                      </b>
                    </p>
                  </p>
                  <p className='undp-typography'>
                    {t('energy-saved-mj')}
                    {' - '}
                    <b>
                      <EditableCell
                        text={o.energySaved ? format('~s')(o.energySaved).replace('G', 'B') : 'N/A'}
                        fieldName='energySaved'
                        outputId={o.id}
                        sendUpdate={sendUpdateCallback}
                      />
                    </b>
                  </p>
                </div>
                <div
                  style={{ width: '60%' }}
                  className={
                    `undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`
                  }
                >
                  <EditableCell
                    text={o.description}
                    outputId={o.id}
                    fieldName='description'
                    sendUpdate={sendUpdateCallback}
                  />
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
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <div className='undp-scrollbar' style={{ height: '20rem' }}>
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
          projects.map((project, i) => (<Project key={`${i}project`} project={project} />))
        }
      </div>
    </>
  );
};
