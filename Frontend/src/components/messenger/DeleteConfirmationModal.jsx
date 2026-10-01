import {
  useConfirmDeleteMessages,
  useSelectedMessageIds,
  useSetShowDeleteConfirmation,
  useShowDeleteConfirmation,
} from "../../stores/chatStore";

const DeleteConfirmationModal = () => {
  const showDeleteConfirmation = useShowDeleteConfirmation();
  const setShowDeleteConfirmation = useSetShowDeleteConfirmation();
  const selectedMessageIds = useSelectedMessageIds();
  const confirmDeleteMessages = useConfirmDeleteMessages();

  if (!showDeleteConfirmation) return null;

  const targetLabel =
    selectedMessageIds.length === 1
      ? "this message"
      : `these ${selectedMessageIds.length} messages`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Deletion
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {targetLabel}? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirmation(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDeleteMessages}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
