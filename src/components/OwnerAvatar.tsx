export function OwnerAvatar({ name, size = 20 }: { name: string; size?: number }) {
    const initials =
        name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

    return (
        <div
            className="rounded-full bg-[#111111] text-[#E5F23A] flex items-center justify-center font-bold font-space shrink-0"
            style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.4)) }}
        >
            {initials}
        </div>
    );
}