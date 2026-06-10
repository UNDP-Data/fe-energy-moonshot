import {
  memo, useState, useEffect, useRef, useCallback, useLayoutEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { format } from 'd3-format';
import {
  Modal, Form, Input, message,
} from 'antd';
import { ProjectLevelDataType } from '../Types';
import { EditableCell } from '../Components/EditableCell';
import { addProposedEdit } from '../firebase';
import { buildProjectDocumentDownloadUrl } from '../utils/assistant';

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

const ProjectInfoLink = styled.a`
  color: var(--blue-600);
  text-decoration: underline;
`;

const ProjectDocumentButton = styled.button`
  background: transparent;
  border: 0;
  color: var(--blue-600);
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
  &:disabled {
    color: var(--gray-600);
    cursor: wait;
  }
`;

const getProjectMetadataValue = (
  project: ProjectLevelDataType,
  keys: string[],
) => {
  const value = keys
    .map((key) => (project as any)[key])
    .find((item) => item !== undefined && item !== null && `${item}`.trim() !== '');
  return value === undefined || value === null ? '' : `${value}`;
};

const getProjectNumber = (project: ProjectLevelDataType) => getProjectMetadataValue(project, [
  'Project Number',
  'projectNumber',
  'project number',
  'project_number',
  'Project ID',
  'projectId',
  'id',
]);

const extractUrls = (value: string | null | undefined) => (
  (value || '').match(/https?:\/\/[^\s]+/g) || []
).map((url) => url.trim());

const getProjectDetailsUrl = (project: ProjectLevelDataType) => {
  const urls = extractUrls(project.link);
  if (!urls.length) return '';

  if (project.verticalFunded) {
    return urls.find((url) => url.includes('pims.undp.org')) || urls[0];
  }
  return urls.find((url) => url.includes('open.undp.org')) || urls[0];
};

const getProjectDetailsLabelKey = (project: ProjectLevelDataType) => (
  project.verticalFunded ? 'pims-plus' : 'transparency-portal'
);

const logProdocDebug = (label: string, detail: Record<string, unknown>) => {
  // eslint-disable-next-line no-console
  console.log(`[Moonshot Prodoc] ${label}`, detail);
};

const PROJECT_DOCUMENT_URL_KEYS = [
  'projectDocumentUrl',
  'projectDocumentURL',
  'project_document_url',
  'prodocUrl',
  'prodocURL',
  'prodoc_url',
  'Project Document URL',
  'Project Document',
  'projectDocument',
  'Source_documentation',
];

const getProjectDocumentUrl = (project: ProjectLevelDataType) => {
  for (const key of PROJECT_DOCUMENT_URL_KEYS) {
    const rawValue = (project as any)[key];
    if (rawValue === undefined || rawValue === null) continue;
    const normalized = `${rawValue}`.trim();
    if (!normalized || /^n\/?a$/i.test(normalized)) continue;
    const [url] = extractUrls(normalized);
    if (url) return url;
  }
  return '';
};

const triggerHiddenDownload = (downloadUrl: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = downloadUrl;
  document.body.appendChild(iframe);
  window.setTimeout(() => {
    iframe.remove();
  }, 60000);
};

const Project = memo((props:ProjectProps) => {
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
  const status = getProjectMetadataValue(project, ['Status', 'status']);
  const startYear = getProjectMetadataValue(project, ['Start Year', 'startYear', 'start_year']);
  const endYear = getProjectMetadataValue(project, ['End Year', 'endYear', 'end_year']);
  const projectNumber = getProjectNumber(project);
  const projectDetailsUrl = getProjectDetailsUrl(project);
  const projectDetailsLabelKey = getProjectDetailsLabelKey(project);
  const projectDocumentUrl = getProjectDocumentUrl(project);
  const [prodocLoading, setProdocLoading] = useState(false);
  const titleDescriptionRef = useRef<HTMLDivElement | null>(null);
  const projectInfoRef = useRef<HTMLDivElement | null>(null);
  const [outputMaxHeight, setOutputMaxHeight] = useState<number | undefined>();

  const hideModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    userRef.current = userData;
    modalRef.current = modalOpen;
  }, [modalOpen, userData]);

  useLayoutEffect(() => {
    const updateOutputHeight = () => {
      const titleDescriptionHeight = titleDescriptionRef.current?.offsetHeight || 0;
      const projectInfoHeight = projectInfoRef.current?.offsetHeight || 0;
      const nextHeight = Math.max(titleDescriptionHeight, projectInfoHeight);
      setOutputMaxHeight((currentHeight) => (
        currentHeight === nextHeight ? currentHeight : nextHeight
      ));
    };

    updateOutputHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateOutputHeight);
    if (titleDescriptionRef.current) resizeObserver.observe(titleDescriptionRef.current);
    if (projectInfoRef.current) resizeObserver.observe(projectInfoRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [project]);

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

  const sendUpdate = useCallback(async (value:string, fieldName:string, outputId?:string) => {
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
        content: t('update-sent'),
        duration: 5,
        className: 'undp-message',
      });
    }
  }, [messageApi, project.id, t]);

  const handleProdocDownload = useCallback(async () => {
    setProdocLoading(true);
    try {
      logProdocDebug('download clicked', {
        projectId: project.id,
        projectNumber,
        title: project.title,
        verticalFunded: project.verticalFunded,
        projectDocumentUrl,
      });
      if (!projectDocumentUrl) {
        logProdocDebug('download not found', {
          projectId: project.id,
          projectNumber,
        });
        messageApi.open({
          type: 'error',
          content: t('prodoc-not-found'),
          duration: 5,
          className: 'undp-message',
        });
        return;
      }

      const downloadUrl = buildProjectDocumentDownloadUrl({
        sourceUrl: projectDocumentUrl,
      });
      logProdocDebug('triggering attachment download', {
        projectId: project.id,
        projectNumber,
        projectDocumentUrl,
        downloadUrl,
      });
      triggerHiddenDownload(downloadUrl);
    } catch (error) {
      logProdocDebug('download error', {
        projectId: project.id,
        projectNumber,
        error,
        message: error instanceof Error ? error.message : `${error}`,
      });
      messageApi.open({
        type: 'error',
        content: t('prodoc-load-error'),
        duration: 5,
        className: 'undp-message',
      });
    } finally {
      setProdocLoading(false);
    }
  }, [messageApi, project, projectDocumentUrl, projectNumber, t]);

  return (
    <>
      {
        contextHolder
      }
      <div className='undp-table-row'>
        <div style={{ width: '30%', background: 'transparent' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <div ref={titleDescriptionRef}>
              <h6 className='undp-typography'>
                {
                  (project.title) && (
                    <EditableCell
                      text={project.title}
                      fieldName='title'
                      sendUpdate={sendUpdate}
                    />
                  )
                }
                {' - '}
                <EditableCell
                  text={project.id ? project.id : '__'}
                  fieldName='id'
                  sendUpdate={sendUpdate}
                />
                {project.genderMarker && ' - '}
                {
                  (project.genderMarker) && (
                    <EditableCell
                      text={project.genderMarker}
                      fieldName='genderMarker'
                      sendUpdate={sendUpdate}
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
                      sendUpdate={sendUpdate}
                    />
                  )
                }
              </p>
            </div>
          </div>
        </div>
        <div style={{ width: '20%', background: 'transparent' }} className='undp-table-row-cell'>
          <div className='padding-left-05 padding-right-05'>
            <div ref={projectInfoRef}>
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
                  sendUpdate={sendUpdate}
                />
              </p>
              <p className='undp-typography'>
                {
                  (typeof project.verticalFunded === 'boolean') && (
                    <>
                      {t('type')}
                      {' - '}
                      <EditableCell
                        text={t(project.verticalFunded ? 'vf' : 'non-vf')}
                        fieldName='verticalFunded'
                        sendUpdate={sendUpdate}
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
                        sendUpdate={sendUpdate}
                      />
                    </>
                  )
                }
              </p>

              <p className='undp-typography'>
                {
                  projectDetailsUrl ? (
                    <>
                      {t('project-details')}
                      {' - '}
                      <ProjectInfoLink
                        href={projectDetailsUrl}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {t(projectDetailsLabelKey)}
                      </ProjectInfoLink>
                    </>
                  ) : (
                    <>
                      {t('project-details')}
                      {' - '}
                      <EditableCell
                        text='__'
                        fieldName='link'
                        sendUpdate={sendUpdate}
                      />
                    </>
                  )
                }
              </p>
              <p className='undp-typography'>
                {t('donors')}
                {' - '}
                <EditableCell
                  text={project.donors === null ? '__' : project.donors.join(', ')}
                  fieldName='donors'
                  sendUpdate={sendUpdate}
                />
              </p>
              <p className='undp-typography'>
                {t('status')}
                {' - '}
                <EditableCell
                  text={status || '__'}
                  fieldName='status'
                  sendUpdate={sendUpdate}
                />
              </p>
              <p className='undp-typography'>
                {t('start-year')}
                {' - '}
                <EditableCell
                  text={startYear || '__'}
                  fieldName='startYear'
                  sendUpdate={sendUpdate}
                />
              </p>
              <p className='undp-typography'>
                {t('end-year')}
                {' - '}
                <EditableCell
                  text={endYear || '__'}
                  fieldName='endYear'
                  sendUpdate={sendUpdate}
                />
              </p>
              <p className='undp-typography'>
                {t('project-document')}
                {' - '}
                {
                  projectDocumentUrl ? (
                    <ProjectDocumentButton
                      type='button'
                      onClick={handleProdocDownload}
                      disabled={prodocLoading}
                    >
                      {prodocLoading ? t('loading') : t('download')}
                    </ProjectDocumentButton>
                  ) : 'NA'
                }
              </p>
            </div>
          </div>
        </div>
        <div style={{ width: '50%', background: 'transparent' }} className='undp-table-row-cell'>
          <div
            className='moonshot-output-scroll'
            style={outputMaxHeight ? { maxHeight: outputMaxHeight } : undefined}
          >
            {
              project.outputs.map((o, i) => (
                <div key={`${i}output`} className='flex-div moonshot-output-row'>
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
                        text={o.directBeneficiaries ? format('~s')(o.directBeneficiaries).replace('G', 'B') : t('indirect-beneficiaries')}
                        fieldName='beneficiaries'
                        outputId={o.id}
                        sendUpdate={sendUpdate}
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
                              sendUpdate={sendUpdate}
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
                              sendUpdate={sendUpdate}
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
                        sendUpdate={sendUpdate}
                      />
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
                            sendUpdate={sendUpdate}
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
      </div>
      <Modal
        open={modalOpen}
        className='undp-modal'
        title={t('edit-modal-title')}
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
            <p className='undp-typography label'>{t('position')}</p>
            <Form.Item<FieldType>
              name='position'
              rules={[{ required: true, message: t('feedback-position-required') }]}
            >
              <Input
                className='undp-input'
                placeholder={t('feedback-position-placeholder')}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 16 }}>
              <button
                className='undp-button button-secondary'
                type='submit'
              >
                {t('submit')}
              </button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
});

Project.displayName = 'Project';

const DataTableComponent = (props: TableProps) => {
  const {
    projects,
    countryLinkDict,
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <div className='undp-scrollbar moonshot-project-table' style={{ height: '40rem' }}>
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
          projects.map((project) => (
            <Project
              key={project.id || `${project.countryCode}-${project.title}`}
              countryLinkDict={countryLinkDict}
              project={project}
            />
          ))
        }
      </div>
    </>
  );
};

export const DataTable = memo(DataTableComponent);

DataTable.displayName = 'DataTable';
