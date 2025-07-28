import { App, Notice, Plugin, WorkspaceLeaf, TFile } from 'obsidian';

interface LeafData {
	leaf: WorkspaceLeaf;
	name: string;
	filePath: string | null;
}

export default class TabControlPlugin extends Plugin {

	async onload() {
		// Add command to sort tabs by name
		this.addCommand({
			id: 'sort-tabs-by-name',
			name: 'Sort tabs by name',
			callback: () => {
				this.sortTabsByName();
			}
		});

		// Add command to remove duplicate tabs
		this.addCommand({
			id: 'remove-duplicate-tabs',
			name: 'Remove duplicate tabs (keep one)',
			callback: () => {
				this.removeDuplicateTabs();
			}
		});

		// Add command to do both operations
		this.addCommand({
			id: 'organize-tabs',
			name: 'Organize tabs (sort and remove duplicates)',
			callback: () => {
				// First remove duplicates, then sort
				this.removeDuplicateTabs();
				// Small delay to ensure duplicate removal completes before sorting
				setTimeout(() => {
					this.sortTabsByName();
				}, 50);
			}
		});

		// Add ribbon icon for quick access
		this.addRibbonIcon('layers', 'Organize tabs', () => {
			this.removeDuplicateTabs();
			setTimeout(() => {
				this.sortTabsByName();
			}, 50);
		});
	}

	sortTabsByName() {
		const workspace = this.app.workspace;
		
		// Get all leaves that are currently in tabs
		const allLeaves = this.getAllTabLeaves();
		
		if (allLeaves.length === 0) {
			new Notice('No tabs found to sort');
			return;
		}

		// Group leaves by their parent container
		const tabGroups = new Map<any, WorkspaceLeaf[]>();
		allLeaves.forEach(leaf => {
			const parent = leaf.parent;
			if (!tabGroups.has(parent)) {
				tabGroups.set(parent, []);
			}
			tabGroups.get(parent)!.push(leaf);
		});

		let totalSorted = 0;
		const activeLeaf = workspace.getLeaf;

		// Sort each tab group
		tabGroups.forEach((leaves, parent) => {
			if (leaves.length <= 1) return;

			// Create array of leaf data with their display names
			const leafData: LeafData[] = leaves.map(leaf => ({
				leaf,
				name: this.getLeafDisplayName(leaf),
				filePath: this.getLeafFilePath(leaf)
			}));

			// Check if already sorted
			const currentOrder = leafData.map(data => data.name);
			const sortedOrder = [...currentOrder].sort((a, b) => 
				a.toLowerCase().localeCompare(b.toLowerCase())
			);

			if (JSON.stringify(currentOrder) === JSON.stringify(sortedOrder)) {
				return; // Already sorted, skip this group
			}

			// Sort by name (case-insensitive)
			leafData.sort((a, b) => 
				a.name.toLowerCase().localeCompare(b.name.toLowerCase())
			);

			// Reorder tabs by manipulating the parent's children array
			try {
				// Access the parent's children array directly
				const parentChildren = (parent as any).children;
				if (parentChildren && Array.isArray(parentChildren)) {
					// Clear the children array
					parentChildren.length = 0;
					// Add leaves back in sorted order
					leafData.forEach(data => {
						parentChildren.push(data.leaf);
					});
					
					// Force a layout update
					if (typeof (parent as any).recomputeChildrenDimensions === 'function') {
						(parent as any).recomputeChildrenDimensions();
					}
					
					totalSorted += leaves.length;
				}
			} catch (error) {
				console.error('Error reordering tabs:', error);
				// Fallback: just report that we can't sort this group
				new Notice('Could not sort some tabs - they may be in a special view');
			}
		});

		// Trigger a workspace layout save to persist the changes
		workspace.requestSaveLayout();

		if (totalSorted > 0) {
			new Notice(`Sorted ${totalSorted} tabs by name`);
			
			// Restore the active leaf if it was moved
			if (activeLeaf) {
				workspace.setActiveLeaf(activeLeaf, { focus: true });
			}
		} else {
			new Notice('Tabs are already sorted alphabetically');
		}
	}

	removeDuplicateTabs() {
		const workspace = this.app.workspace;
		
		// Get all leaves that are currently in tabs
		const allLeaves = this.getAllTabLeaves();
		
		if (allLeaves.length === 0) {
			new Notice('No tabs found to process');
			return;
		}

		// Track seen files by their path
		const seenFiles = new Map<string, WorkspaceLeaf>();
		const duplicatesToClose: WorkspaceLeaf[] = [];

		allLeaves.forEach(leaf => {
			const filePath = this.getLeafFilePath(leaf);
			const displayName = this.getLeafDisplayName(leaf);
			
			// Use file path as the primary key, fall back to display name for non-file views
			const key = filePath || displayName;
			
			if (seenFiles.has(key)) {
				// This is a duplicate - mark for closing
				duplicatesToClose.push(leaf);
			} else {
				// First occurrence - keep it
				seenFiles.set(key, leaf);
			}
		});

		// Close duplicate tabs
		duplicatesToClose.forEach(leaf => {
			leaf.detach();
		});

		const removedCount = duplicatesToClose.length;
		if (removedCount > 0) {
			new Notice(`Removed ${removedCount} duplicate tabs`);
		} else {
			new Notice('No duplicate tabs found');
		}
	}

	private getAllTabLeaves(): WorkspaceLeaf[] {
		const leaves: WorkspaceLeaf[] = [];
		
		// Get all leaves from workspace
		this.app.workspace.iterateAllLeaves(leaf => {
			// Check if this leaf is in a tab container (has siblings or is in a tab group)
			if (leaf.parent && (leaf.parent as any).type === 'tabs') {
				leaves.push(leaf);
			}
		});

		return leaves;
	}

	private getLeafDisplayName(leaf: WorkspaceLeaf): string {
		if (leaf.view && leaf.view.getDisplayText) {
			return leaf.view.getDisplayText();
		}
		
		// Fallback to file name if available
		const file = this.getLeafFile(leaf);
		if (file) {
			return file.basename;
		}
		
		// Final fallback
		return leaf.view?.getViewType() || 'Unknown';
	}

	private getLeafFilePath(leaf: WorkspaceLeaf): string | null {
		const file = this.getLeafFile(leaf);
		return file ? file.path : null;
	}

	private getLeafFile(leaf: WorkspaceLeaf): TFile | null {
		// Check if the view has a file property and it's a TFile
		const view = leaf.view as any;
		if (view && view.file && view.file instanceof TFile) {
			return view.file;
		}
		return null;
	}

	onunload() {
		// Plugin cleanup if needed
	}
}
