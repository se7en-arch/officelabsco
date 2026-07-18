import MediaLibrary from '@/components/admin/MediaLibrary';

export default function MediaPage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Медийна библиотека</h1>
          <p>Всички качени снимки</p>
        </div>
      </div>
      <MediaLibrary />
    </>
  );
}
