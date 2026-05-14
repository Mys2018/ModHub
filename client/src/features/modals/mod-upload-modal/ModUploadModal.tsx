import styles from './ModUploadModal.module.css';
import { useState, useEffect } from 'react';
import { useModalStore } from '../../../shared/ui/model/useModalStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '../../../shared/mods/api/requests';
import { uploadNewVersion } from '../../../shared/mods/api/requests';

export const ModUploadModal = () => {
  const { isOpen, mode, modId, initialData, closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [targetDevice, setTargetDevice] = useState('');
  const [androidVersion, setAndroidVersion] = useState('');

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setTargetDevice(initialData.targetDevice || '')
      setAndroidVersion(initialData.androidVersion || '')
    } else {
      setTitle('');
      setDescription('');
      setTargetDevice('')
      setAndroidVersion('')
    }
    setVersion('');
    setFile(null);
  }, [initialData, isOpen]);

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] });
      queryClient.invalidateQueries({ queryKey: ['myMods'] });
      closeModal();
    }
  });

  const addVersionMutation = useMutation({
    mutationFn: (formData: FormData) => uploadNewVersion(modId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMods'] });
      closeModal();
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!file || !version) return;

    const formData = new FormData();
    formData.append('version', version);
    formData.append('mod_file', file);
    formData.append('targetDevice', targetDevice)
    formData.append('androidVersion', androidVersion)

    if (mode === 'create') {
      if (!title) return;
      formData.append('title', title);
      formData.append('description', description);
      createMutation.mutate(formData);
    } else if (mode === 'add_version' && modId) {
      addVersionMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || addVersionMutation.isPending;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{mode === 'create' ? 'Загрузка нового мода' : 'Обновление мода'}</h3>
          <div className={styles.info}>
            <div className={styles.mainInfo}>
              <div className={styles.name}>
                <label className={styles.label}>Название</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={mode === 'add_version'}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.description}>
                <label className={styles.label}>Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={mode === 'add_version'}
                  className={`${styles.input} ${styles.textarea}`}
                />
              </div>
            </div>

            <div className={styles.secondInfo}>
              <div className={styles.version}>
                <label className={styles.label}>Версия</label>
                <input
                  id='version'
                  className={styles.input}
                  type='text'
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>

              <div className={styles.targetDevice}>
                <label className={styles.label}>Устройство</label>
                <input
                  id='targetDevice'
                  className={styles.input}
                  type='text'
                  value={targetDevice}
                  onChange={(e) => setTargetDevice(e.target.value)}
                />
              </div>

              <div className={styles.androidVersion}>
                <label className={styles.label}>Версия OS</label>
                <input
                  id='androidVersion'
                  className={styles.input}
                  type='text'
                  value={androidVersion}
                  onChange={(e) => setAndroidVersion(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.file}>
            <label className={styles.label}>Загрузите файл</label>
            <input
              id='name'
              className={styles.inputFile}
              type='file'
              accept='.zip,.rar,.7z'
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? 'Загрузка...' : mode === 'create' ? 'Опубликовать мод' : 'Отправить на проверку'}
          </button>
        </form>
      </div>
    </div>
  );
};