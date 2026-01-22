import { categories } from '../data/mockData';

const CategorySidebar = ({ selectedCategory, setSelectedCategory }) => {

  return (
    <aside className="category-sidebar">
      <ul className="category-list">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <li 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-item ${isActive ? 'active' : ''}`}
            >
              {cat.icon} {cat.name}
            </li>
          );
        })}
      </ul>
      <style>{`
        .category-sidebar {
          width: 200px;
          flex-shrink: 0;
        }
        .category-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-item {
          padding: 12px 16px;
          borderRadius: 8px;
          fontSize: 16px;
          font-weight: 500;
          color: var(--text-main);
          background-color: transparent;
          cursor: pointer;
          transition: 0.2s;
          border: 1px solid transparent;
          border-radius: 8px;
          white-space: nowrap;
        }
        .category-item:hover {
          background-color: #f1f5f9;
        }
        .category-item.active {
          font-weight: 700;
          color: var(--primary);
          background-color: #f0fdf4;
          border: 1px solid var(--primary);
        }

        @media (max-width: 768px) {
          .category-sidebar {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 8px;
            scroll-behavior: smooth;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .category-sidebar::-webkit-scrollbar {
            display: none;
          }
          .category-list {
            flex-direction: row;
            gap: 12px;
          }
          .category-item {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </aside>
  );
};

export default CategorySidebar;
