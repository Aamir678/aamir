import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-light py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-neutral-medium">
          Timetable Generator &copy; {new Date().getFullYear()}
        </div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="#">
            <a className="text-sm text-neutral-medium hover:text-primary">Help</a>
          </Link>
          <Link href="#">
            <a className="text-sm text-neutral-medium hover:text-primary">Privacy Policy</a>
          </Link>
          <Link href="#">
            <a className="text-sm text-neutral-medium hover:text-primary">Terms of Service</a>
          </Link>
        </div>
      </div>
    </footer>
  );
}
