interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  fromWidget: any;
}