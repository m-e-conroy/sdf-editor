// SDF Studio 3D - Main Application Entrypoint
import './styles/studio.css';

// Register Native Web Components
import './components/SdfMenuBar';
import './components/SdfViewport';
import './components/SdfWindow';
import './components/SdfDockTray';
import './components/SdfOutliner';
import './components/SdfInspector';
import './components/SdfStatusBar';
import './components/SdfExportModal';
import './components/SdfApp';

// Restore user theme preference
const savedTheme = localStorage.getItem('sdf_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

console.log('[SDF Studio 3D] Native Web Components and Workspace initialized.');
