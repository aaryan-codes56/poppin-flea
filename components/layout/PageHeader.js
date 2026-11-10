import StringLights from '../ui/StringLights';
import { Snow } from '../ui/motion';
import p from '@/styles/pages.module.css';

// Compact dark header used on inner pages.
export default function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <header className={`${p.pageHeader} tone-dark`}>
      <StringLights className={p.pageLights} count={20} />
      <Snow count={18} />
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={p.pageTitle}>{title}</h1>
        {intro && <p className={p.pageIntro}>{intro}</p>}
        {children}
      </div>
    </header>
  );
}
