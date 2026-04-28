import { useParams } from 'react-router-dom'

export function ProductDetailPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Produto {id}</h1>
      <p className="text-muted-foreground mt-4">Página em construção...</p>
    </div>
  )
}
