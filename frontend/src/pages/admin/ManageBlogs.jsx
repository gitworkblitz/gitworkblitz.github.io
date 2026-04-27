import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { PenSquare, Trash2, Plus, Search, Eye, EyeOff, Save, X, FileText, Image } from 'lucide-react'
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firestoreService'
import { TableSkeleton } from '../../components/SkeletonLoader'
import toast from 'react-hot-toast'

const EMPTY_POST = {
  title: '', slug: '', excerpt: '', content: '', category: 'General',
  author: 'WorkSphere Team', cover_image: '', is_published: false, tags: '',
}

const CATEGORIES = ['General', 'Tips & Tricks', 'Industry News', 'Company Updates', 'How-To Guides', 'Worker Stories']

export default function ManageBlogs() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [form, setForm] = useState(EMPTY_POST)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Manage Blog | WorkSphere Admin'
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments('blogs')
      setPosts(data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')))
    } catch {
      setPosts([])
    } finally { setLoading(false) }
  }

  const filtered = useMemo(() =>
    posts.filter(p => !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.author?.toLowerCase().includes(search.toLowerCase())
    ),
    [posts, search]
  )

  const openEditor = useCallback((post = null) => {
    if (post) {
      setEditingPost(post)
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || 'General',
        author: post.author || 'WorkSphere Team',
        cover_image: post.cover_image || '',
        is_published: post.is_published ?? false,
        tags: (post.tags || []).join(', '),
      })
    } else {
      setEditingPost(null)
      setForm(EMPTY_POST)
    }
    setShowEditor(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const slug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const postData = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        author: form.author.trim(),
        cover_image: form.cover_image.trim(),
        is_published: form.is_published,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      if (editingPost) {
        await updateDocument('blogs', editingPost.id, postData)
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...postData } : p))
        toast.success('Blog post updated')
      } else {
        const id = await createDocument('blogs', postData)
        setPosts(prev => [{ id, ...postData, createdAt: new Date().toISOString() }, ...prev])
        toast.success('Blog post created')
      }
      setShowEditor(false)
    } catch (err) {
      toast.error('Failed to save blog post')
      console.error(err)
    } finally { setSaving(false) }
  }, [form, editingPost])

  const handleDelete = useCallback(async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return
    try {
      await deleteDocument('blogs', postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Blog post deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }, [])

  const togglePublish = useCallback(async (post) => {
    try {
      await updateDocument('blogs', post.id, { is_published: !post.is_published })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p))
      toast.success(post.is_published ? 'Post unpublished' : 'Post published')
    } catch {
      toast.error('Failed to update')
    }
  }, [])

  if (loading) return <div className="p-6"><TableSkeleton rows={6} /></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Blog</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{posts.length} blog posts</p>
        </div>
        <button onClick={() => openEditor()} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card mb-5 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search blog posts…"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {/* Blog Post Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowEditor(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-white font-bold text-lg">{editingPost ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowEditor(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Blog post title" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Slug</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated-from-title" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short description (shown in blog list)" rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Full blog post content (supports markdown)" rows={8}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="Author name" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="react, firebase, tips" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Cover Image URL</label>
                <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                  placeholder="https://..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{form.is_published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditor(false)} disabled={saving}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {editingPost ? 'Update' : 'Create'} Post</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>{['Title', 'Category', 'Author', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.title || 'Untitled'}</p>
                    {post.excerpt && <p className="text-xs text-gray-400 truncate max-w-[250px] mt-0.5">{post.excerpt}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">{post.category || 'General'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{post.author || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(post)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${post.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {post.is_published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditor(post)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                        <PenSquare className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2" />
              <p className="mb-3">No blog posts yet</p>
              <button onClick={() => openEditor()} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Create your first post →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
