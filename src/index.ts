// Utils
export { cn } from './utils/cn'
export { formatDateTime, formatAmount, formatMoney } from './utils/formatters'

// Types
export type { ApiResponse, PaginatedData } from './types/api'
export { normalizePaginated } from './types/api'

// API
export { createClient, type CreateClientOptions, type TypedClient } from './api/createClient'

// Store
export { createAuthStore, type AuthState, type CreateAuthStoreOptions } from './store/createAuthStore'

// i18n
export { I18nProvider, I18nContext, type I18nContextValue } from './i18n/provider'
export { useT } from './i18n/useT'
export type { Locale, TranslationDict, Translations } from './i18n/types'

// UI Components
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './ui/Button'
export { Badge, type BadgeProps, type BadgeVariant } from './ui/Badge'
export { Alert, type AlertProps, type AlertVariant } from './ui/Alert'
export { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
export { Input, type InputProps } from './ui/Input'
export { Textarea, type TextareaProps } from './ui/Textarea'
export {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger,
  SimpleDialog,
} from './ui/Dialog'
export {
  Select, SelectContent, SelectField, SelectGroup, SelectItem,
  SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
  type SelectFieldProps, type SelectOption,
} from './ui/Select'
export {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from './ui/DropdownMenu'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
export { Switch } from './ui/Switch'
export { Checkbox } from './ui/Checkbox'
export {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger,
} from './ui/AlertDialog'
export { ScrollArea, ScrollBar } from './ui/ScrollArea'
export { Separator } from './ui/Separator'
export {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/Table'
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/Accordion'
export { AspectRatio } from './ui/AspectRatio'
export { RadioGroup, RadioGroupItem } from './ui/RadioGroup'
export { Toolbar, ToolbarSeparator } from './ui/Toolbar'
export { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'

// Components
export { ErrorBoundary } from './components/ErrorBoundary'
export { DataTable, type Column, type DataTableProps } from './components/DataTable'
export { Pagination } from './components/Pagination'
export { Layout, type LayoutProps } from './components/Layout'
export { PageHeader, type PageHeaderProps } from './components/PageHeader'
export { FilterBar } from './components/FilterBar'
export { EmptyState, type EmptyStateProps } from './components/EmptyState'
export { StatusBadge, type StatusBadgeProps } from './components/StatusBadge'
export { ConfirmDialog, type ConfirmDialogProps } from './components/ConfirmDialog'
export { ConfirmButton, type ConfirmButtonProps } from './components/ConfirmButton'
export { RowActions, type RowAction, type RowActionsProps } from './components/RowActions'
export {
  CheckboxField,
  FileInput,
  RangeInput,
  ToggleChip,
  type CheckboxFieldProps,
  type FileInputProps,
  type RangeInputProps,
  type ToggleChipProps,
} from './components/FormControls'
export {
  SidebarNavigation,
  TopNavigation,
  type NavigationLinkComponent,
  type NavigationLinkProps,
  type SidebarNavigationItem,
  type SidebarNavigationProps,
  type TopNavigationItem,
  type TopNavigationProps,
} from './components/Navigation'

// Chat widgets
export {
  ConversationView,
  LanguageSwitcher,
  MessageBubble,
  MessageInput,
  MessageList,
  TransferToHumanButton,
  TypingIndicator,
  chatI18n,
  chatT,
  pickChatDictionary,
} from './chat'
export type {
  ChatConversation,
  ChatDictionary,
  ChatLang,
  ChatLanguage,
  ChatMessage,
  ChatMessageRole,
  ConversationFetcher,
  ConversationViewProps,
  LanguageSwitcherProps,
  MessageBubbleProps,
  MessageInputProps,
  MessageListProps,
  TransferToHumanButtonProps,
  TypingIndicatorProps,
} from './chat'

// Hooks
export { usePagination } from './hooks/usePagination'

// OpcOrbit shared API/domain primitives
export * from './opcorbit/control'
export type { Principal } from './opcorbit/types/principal'
export type { Tenant } from './opcorbit/types/tenant'
export * from './opcorbit/domain/api/client'
export * from './opcorbit/domain/api/customer-service'
export * from './opcorbit/domain/api/shape'
export * from './opcorbit/domain/feature-pack/contract'
export * from './opcorbit/domain/permissions/capabilities'
export * from './opcorbit/domain/queries/control'
export * from './opcorbit/domain/queries/keys'
export * from './opcorbit/domain/schemas/common'
export * from './opcorbit/domain/tables/columns'

// Opt-in presentation compatibility for detail and configuration screens.
export * as presentation from './presentation/index'
