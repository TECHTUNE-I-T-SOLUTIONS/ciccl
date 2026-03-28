"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

type Props = {
  onConfirm?: () => void;
  children?: React.ReactNode; // trigger element
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function LogoutConfirm({
  onConfirm = () => {},
  children,
  title = 'Confirm logout',
  description = 'Are you sure you want to log out? You will need to sign in again to access the admin dashboard.',
  confirmLabel = 'Log out',
  cancelLabel = 'Cancel',
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/5 transition">
            {confirmLabel}
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
