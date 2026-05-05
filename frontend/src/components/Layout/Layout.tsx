import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Tags, 
  Users, 
  LogOut, 
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Layout.module.css';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'] },
    { name: 'Meus Reembolsos', icon: FileText, path: '/reimbursements', roles: ['COLABORADOR'] },
    { name: 'Análises', icon: ClipboardList, path: '/reimbursements/review', roles: ['GESTOR'] },
    { name: 'Pagamentos', icon: ClipboardList, path: '/reimbursements/pay', roles: ['FINANCEIRO'] },
    { name: 'Categorias', icon: Tags, path: '/categories', roles: ['ADMIN'] },
    { name: 'Usuários', icon: Users, path: '/users', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <ShieldCheck size={28} />
        <span>Pitang</span>
      </div>

      <nav className={styles.nav}>
        {filteredMenu.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userRole}>{user?.role.toLowerCase()}</span>
        </div>
        <button 
          onClick={() => {
            signOut();
            navigate('/login');
          }} 
          className={styles.logoutBtn}
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
