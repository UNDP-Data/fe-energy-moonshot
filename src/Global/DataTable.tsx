import {
  useState, useEffect, useRef,
  // useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'd3-format';
import {
  Modal, Form, Input,
  // message,
} from 'antd';
import { ProjectLevelDataType } from '../Types';
// import { EditableCell } from '../Components/EditableCell';
// import { addProposedEdit } from '../firebase';

interface TableProps {
  countryLinkDict: any;
  projects: ProjectLevelDataType[];
}

interface ProjectProps {
  countryLinkDict: any;
  project: ProjectLevelDataType;
}

interface CellProps {
  value: string | 0 | null;
  // fieldName: string;
  // outputId?: string;
  // sendUpdate: Function;
  text?:string | null;
}

type FieldType = {
  name: string;
  office: string;
  position: string;
};

const Cell = (props:CellProps) => {
  const {
    value,
    text,
  } = props;

  return (
    <p className='undp-typography'>
      <>
        {
          text && value ? (`${text} - `) : ('')
        }
        {value || ''}
      </>
    </p>
  );
};

const Project = (props:ProjectProps) => {
  const {
    project,
    countryLinkDict,
  } = props;

  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // const [messageApi, contextHolder] = message.useMessage();

  const userRef = useRef(userData);
  const modalRef = useRef(modalOpen);

  const hideModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    userRef.current = userData;
    modalRef.current = modalOpen;
  }, [modalOpen, userData]);

  // function requestUserData() {
  //   return new Promise<void>((resolve, reject) => {
  //     const interval = setInterval(() => {
  //       if (userRef.current) {
  //         clearInterval(interval);
  //         resolve();
  //       }
  //       if (!modalRef.current) {
  //         clearInterval(interval);
  //         reject();
  //       }
  //     }, 300);
  //   });
  // }

  // async function sendUpdate(value:string, fieldName:string, outputId?:string) {
  //   if (!userRef.current) {
  //     setModalOpen(true);
  //     await requestUserData();
  //   }
  //   if (userRef.current) {
  //     await addProposedEdit({
  //       fieldName,
  //       value,
  //       date: new Date().toUTCString(),
  //       outputId,
  //       ...userRef.current as FieldType,
  //       projectId: project.id,
  //     });
  //
  //     messageApi.open({
  //       type: 'success',
  //       content: 'Update sent',
  //       duration: 5,
  //       className: 'undp-message',
  //     });
  //   }
  // }

  // const sendUpdateCallback = useCallback(sendUpdate, []);

  return (
    <>
      {
        // contextHolder
      }
      <div className='undp-table-row'>
        <div style={{ width: '30%', background: 'transparent' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <h6 className='undp-typography'>
              <p className='undp-typography'>
                {project.title
                  ? (
                    <span>
                      {project.title}
                    </span>
                  ) : ('')}
                {' - '}
                {project.id
                  ? (
                    <span>
                      {project.id}
                    </span>
                  ) : ('')}
                {project.genderMarker && ' - '}
                {project.genderMarker
                  ? (
                    <span>
                      {project.genderMarker}
                    </span>
                  ) : ('')}
              </p>

            </h6>
            <Cell
              value={project.description}
            />
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
            <Cell
              text={t('budget')}
              value={Math.abs(project.budget) < 1 ? project.budget && project.budget.toString() : format('.3s')(project.budget).replace('G', 'B')}
            />
            <Cell
              text={t('type')}
              value={t(project.verticalFunded ? 'vf' : 'non-vf')}
            />
            <Cell
              value={project.genderMarker}
              text={t('gender-equality')}
            />
            <Cell
              value={project.ghgEmissions === null ? `${project.ghgEmissions}M ${t('tonnes')}` : null}
              text={t('ghg-emissions-reduction')}
            />
            <Cell
              value={project.ghgEmissions === null ? `${project.ghgEmissions}M ${t('tonnes')}` : null}
              text={t('ghg-emissions-reduction')}
            />
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
                  <Cell
                    value={o.directBeneficiaries !== 0 ? format('.3s')(o.directBeneficiaries).replace('G', 'B') : null}
                    text={o.directBeneficiaries !== 0 ? t('direct-beneficiaries') : null}
                  />
                  <Cell
                    value={o.outputCategory}
                    text={t('select-output-type')}
                  />
                  <Cell
                    value={o.outputCategory === 'Other' ? null : o.beneficiaryCategory}
                    text={t('select-output-sub-type')}
                  />
                  <Cell
                    value={
                      o.percentFemale === null ? null
                        : `${!(o.percentFemale % 1) ? (o.percentFemale) : format(',.2f')(o.percentFemale)}%`
                    }
                    text={t('female-percent')}
                  />
                  <Cell
                    value={o.energySaved === '0' || o.beneficiaryCategory === 'Energy Efficiency' ? format('~s')(o.energySaved).replace('G', 'B') : null}
                    text={t('energy-saved-mj')}
                  />
                </div>
                <div
                  style={{ width: '60%', background: 'transparent' }}
                  className={
                    `undp-table-row-cell ${i === project.outputs.length - 1 ? 'table-cell-no-border' : ''}`
                  }
                >
                  <Cell
                    value={o.description}
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
