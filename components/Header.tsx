import Link from 'next/link';
import NavMenu from './NavMenu';

export default function Header() {
  return (
    <header className="hdr">
      <div className="hdr__in">
        <Link className="logo" href="/">
          <span>FAIR</span>SPACE
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
