const fs = require('fs')

function patch(file, replacements) {
  let c = fs.readFileSync(file, 'utf8')
  let ok = true
  for (const [oldS, newS] of replacements) {
    if (!c.includes(oldS)) {
      console.log('  ✗ NOT FOUND in', file, '→', oldS.substring(0, 60))
      ok = false
      continue
    }
    c = c.split(oldS).join(newS)
  }
  fs.writeFileSync(file, c)
  if (ok) console.log('✓ patched', file)
}

// ============ dashboard home: stack header row + scrollable table ============
patch('src/app/(admin)/dashboard/page.tsx', [
  [
    `<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Kelola aplikasi dan kategori YukiiChii</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>`,
    `<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Kelola aplikasi dan kategori YukiiChii</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>`,
  ],
  [
    '<div className="rounded-lg border border-border bg-background overflow-hidden">\n          <table className="w-full">',
    '<div className="rounded-lg border border-border bg-background overflow-x-auto">\n          <table className="w-full min-w-[560px]">',
  ],
])

// ============ apps list page ============
patch('src/app/(admin)/dashboard/apps/page.tsx', [
  [
    `<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Aplikasi</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus aplikasi</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>`,
    `<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Aplikasi</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus aplikasi</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>`,
  ],
  [
    '<div className="rounded-lg border border-border bg-background overflow-hidden">',
    '<div className="rounded-lg border border-border bg-background overflow-x-auto">',
  ],
])

// ============ categories client ============
patch('src/app/(admin)/dashboard/categories/CategoryClient.tsx', [
  [
    `<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Kategori</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus kategori aplikasi</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>`,
    `<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Kategori</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus kategori aplikasi</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>`,
  ],
  [
    '<div className="rounded-lg border border-border bg-background overflow-hidden">',
    '<div className="rounded-lg border border-border bg-background overflow-x-auto">',
  ],
])

// ============ tags client ============
patch('src/app/(admin)/dashboard/tags/TagClient.tsx', [
  [
    `<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Tag</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus tag aplikasi</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Tag
        </Button>
      </div>`,
    `<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Tag</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus tag aplikasi</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Tag
        </Button>
      </div>`,
  ],
  [
    '<div className="rounded-lg border border-border bg-background overflow-hidden">',
    '<div className="rounded-lg border border-border bg-background overflow-x-auto">',
  ],
])