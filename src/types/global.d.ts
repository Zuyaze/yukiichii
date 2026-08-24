declare module 'next' {
  export * from 'next/dist/server/next-server'
}

declare module 'next/font/google' {
  export function Geist(options: { variable?: string; subsets?: string[] }): { variable: string }
  export function Geist_Mono(options: { variable?: string; subsets?: string[] }): { variable: string }
}

declare module 'next/navigation' {
  export function useRouter(): { push: (url: string) => void; refresh: () => void }
  export function useSearchParams(): { get: (key: string) => string | null }
  export function usePathname(): string
}

declare module 'next/link' {
  import { LinkProps } from 'next/dist/client/link'
  export default function Link(props: LinkProps): JSX.Element
}

declare module 'next/image' {
  import { ImageProps } from 'next/dist/shared/lib/image'
  export default function Image(props: ImageProps): JSX.Element
}

declare module 'next-auth/react' {
  export function useSession(): { data: any; status: string; update: () => void }
  export function signIn(provider?: string, options?: any): Promise<any>
  export function signOut(options?: any): Promise<any>
  export const SessionProvider: React.FC<{ children: React.ReactNode }>
}

declare module 'lucide-react' {
  export const Download: React.FC<React.SVGProps<SVGSVGElement>>
  export const ArrowRight: React.FC<React.SVGProps<SVGSVGElement>>
  export const Smartphone: React.FC<React.SVGProps<SVGSVGElement>>
  export const Monitor: React.FC<React.SVGProps<SVGSVGElement>>
  export const Gamepad2: React.FC<React.SVGProps<SVGSVGElement>>
  export const FileCode: React.FC<React.SVGProps<SVGSVGElement>>
  export const Search: React.FC<React.SVGProps<SVGSVGElement>>
  export const X: React.FC<React.SVGProps<SVGSVGElement>>
  export const Menu: React.FC<React.SVGProps<SVGSVGElement>>
  export const Sun: React.FC<React.SVGProps<SVGSVGElement>>
  export const Moon: React.FC<React.SVGProps<SVGSVGElement>>
  export const Upload: React.FC<React.SVGProps<SVGSVGElement>>
  export const Image: React.FC<React.SVGProps<SVGSVGElement>>
  export const Calendar: React.FC<React.SVGProps<SVGSVGElement>>
  export const Tag: React.FC<React.SVGProps<SVGSVGElement>>
  export const FolderOpen: React.FC<React.SVGProps<SVGSVGElement>>
  export const ExternalLink: React.FC<React.SVGProps<SVGSVGElement>>
  export const Share2: React.FC<React.SVGProps<SVGSVGElement>>
  export const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>
  export const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>>
  export const Plus: React.FC<React.SVGProps<SVGSVGElement>>
  export const Edit: React.FC<React.SVGProps<SVGSVGElement>>
  export const Trash2: React.FC<React.SVGProps<SVGSVGElement>>
  export const Palette: React.FC<React.SVGProps<SVGSVGElement>>
  export const Hash: React.FC<React.SVGProps<SVGSVGElement>>
  export const LayoutDashboard: React.FC<React.SVGProps<SVGSVGElement>>
  export const Box: React.FC<React.SVGProps<SVGSVGElement>>
  export const Tag: React.FC<React.SVGProps<SVGSVGElement>>
  export const Users: React.FC<React.SVGProps<SVGSVGElement>>
  export const Settings: React.FC<React.SVGProps<SVGSVGElement>>
  export const LogOut: React.FC<React.SVGProps<SVGSVGElement>>
  export const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>>
  export const Filter: React.FC<React.SVGProps<SVGSVGElement>>
  export const ChevronDown: React.FC<React.SVGProps<SVGSVGElement>>
  export const Loader2: React.FC<React.SVGProps<SVGSVGElement>>
  export const AlertCircle: React.FC<React.SVGProps<SVGSVGElement>>
}

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: any)
    send(command: any): Promise<any>
  }
  export class PutObjectCommand {
    constructor(input: any)
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options: any): Promise<string>
}

declare module 'next/server' {
  export class NextRequest extends Request {
    constructor(input: string | URL | Request, init?: RequestInit)
    nextUrl: URL
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse
    static redirect(url: string | URL, init?: ResponseInit): NextResponse
    cookies(): any
  }
}

declare module '@libsql/client' {
  export function createClient(config: { url: string; authToken: string }): {
    execute: (query: { sql: string; args?: any[] }) => Promise<{ rows: any[]; lastInsertRowid: bigint | number }>
    batch: (queries: { sql: string; args?: any[] }[]) => Promise<any[]>
  }
}

declare module 'bcryptjs' {
  export function hash(password: string, rounds: number): Promise<string>
  export function compare(password: string, hash: string): Promise<boolean>
}

declare module 'fuse.js' {
  export interface FuseOptions<T> {
    keys: string[]
    threshold?: number
    includeScore?: boolean
    minMatchCharLength?: number
  }
  export interface FuseResult<T> {
    item: T
    score?: number
  }
  export default class Fuse<T> {
    constructor(list: T[], options: FuseOptions<T>)
    search(pattern: string, options?: { limit?: number }): FuseResult<T>[]
  }
}

declare module 'class-variance-authority' {
  export function cva(base: string, config: any): (props?: any) => string
}

declare module 'next-themes' {
  export function ThemeProvider(props: { children: React.ReactNode; attribute?: string; defaultTheme?: string; enableSystem?: boolean }): JSX.Element
  export function useTheme(): { theme: string; setTheme: (theme: string) => void }
}