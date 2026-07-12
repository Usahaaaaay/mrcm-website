import { useState } from 'react'

export function usePagination(pageSize = 10) {
  const [page, setPage] = useState(1)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const totalPages = (count) => Math.max(1, Math.ceil(count / pageSize))

  return { page, setPage, pageSize, from, to, totalPages }
}
