import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-3 shrink-0 cursor-grab touch-none text-slate/40 hover:text-slate active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/** Generic drag-and-drop reorderable list — backs every About Me list section. */
const SortableList = ({ items, onReorder, renderItem, emptyLabel = 'Nothing here yet.' }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate">{emptyLabel}</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item, index)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default SortableList
