
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal(
  { open, onClose, title, children, footer }:
  ModalProps) {

  const dialogRef = useRef<HTMLDialogElement>(null)

  // sync external sys
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (

    <dialog
      ref={dialogRef}

      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}

      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}

      className='w-full max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40'
    >

      <div className='flex flex-col'>
        <header className='flex items-center justify-between border-b border-b-slate-200 px-5 py-3'>
          <h2 className ='text-base font-semibold text-slate-900'>{title}</h2>
          <button
            type='button'
            onClick={onClose}
            area-label='Close dialog'
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >×</button>
    </dialog>

  )
}