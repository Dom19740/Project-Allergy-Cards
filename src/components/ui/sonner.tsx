"use client"

import React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      {/*
        Sonner's <ol> reserves a large invisible hit-region below/around the
        visible toast (for its hover-expand/swipe gestures), with
        pointer-events left at the browser default of "auto". That region
        used to sit harmlessly at the screen's bottom edge, but once toasts
        are positioned nearer the top of the app it overlaps the main
        content and blocks every click until the toast is dismissed. Turn
        pointer events off on the empty container and back on just for the
        actual toast bubbles, so clicks pass through everywhere else.
      */}
      <style>{`
        [data-sonner-toaster] { pointer-events: none; }
        [data-sonner-toaster] [data-sonner-toast] { pointer-events: auto; }
      `}</style>
      <Sonner
        theme="light"
        className="toaster group"
        duration={1000}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }