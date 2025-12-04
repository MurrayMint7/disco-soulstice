
export function Header() {
    return(
        <nav className="bg-background w-full flex items-center justify-between px-8 py-6 text-sm font-medium tracking-widest uppercase">
            <div className="text-primary hover:text-secondary transition-colors cursor-pointer">About</div>
            <div className="text-primary hover:text-secondary transition-colors cursor-pointer">Events</div>
            <div className="text-primary hover:text-secondary transition-colors cursor-pointer">Gallery</div>
            <div className="text-primary hover:text-secondary transition-colors cursor-pointer">Contact</div>
        </nav>
    );
}