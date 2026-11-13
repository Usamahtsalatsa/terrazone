export default function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Baru':
        return 'badge badge-info';
      case 'Menunggu Pemeriksaan':
        return 'badge badge-warning';
      case 'Dalam Perbaikan':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2.5 py-0.5 text-xs font-semibold rounded-full';
      case 'Menunggu Suku Cadang':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2.5 py-0.5 text-xs font-semibold rounded-full';
      case 'Selesai':
        return 'badge badge-success';
      case 'Tidak Dapat Diperbaiki':
        return 'badge badge-danger';
      case 'Normal':
        return 'badge badge-success';
      case 'Rusak':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  };

  return (
    <span className={getStatusStyle(status)}>
      {status}
    </span>
  );
}
