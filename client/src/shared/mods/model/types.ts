export type Mod = {
  id: string;
  title: string;
  description: string;
  author_name: string;
  created_at: string;
  versions: ModVersion[];
}

export type ModVersion = {
  version_id: string;
  version_tag: string;
  target_device: string;
  android_version: string;
  status: ModStatus;
  file_path: string;
  created_at: string;
}

export type ModStatus = 'pending' | 'approved' | 'rejected' | 'error';

export const getStatusName = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Проверен'
    case 'rejected':
      return 'Опасен'
    case 'pending':
      return 'В ожидании'
  }
}

