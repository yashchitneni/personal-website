import { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'My OS | Yash Chitneni',
  description: 'The hardware, software, and systems that power my daily life',
}

interface Item {
  id: string
  name: string
  description: string | null
  link: string | null
  category: string
  created_at: string
}

function ItemGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{item.description || ''}</p>
            <a
              href={item.link || '#'}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Learn More →
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function MyOSPage() {
  const supabase = createClient()
  
  // Fetch all tools from the database
  const { data: tools, error } = await supabase
    .from('my_os_tools')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching tools:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My OS</h1>
          <p className="text-red-600">Error loading tools. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Filter tools by category
  const hardwareItems = tools?.filter(tool => tool.category === 'Hardware & Gear') || []
  const softwareItems = tools?.filter(tool => tool.category === 'Software & Services') || []
  const systemsItems = tools?.filter(tool => tool.category === 'Systems & Frameworks') || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My OS</h1>
        <p className="text-xl text-gray-600">
          The hardware, software, and systems that power my daily life
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Hardware & Gear
          </h2>
          <ItemGrid items={hardwareItems} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Software & Services
          </h2>
          <ItemGrid items={softwareItems} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Systems & Frameworks
          </h2>
          <ItemGrid items={systemsItems} />
        </section>
      </div>
    </div>
  )
} 