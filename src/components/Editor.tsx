import React from 'react';
import Editor from '@monaco-editor/react';

interface Props {
    code: string;
    onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<Props> = ({ code, onChange }) => {
    return (
        <div className="editor-container" style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono',
                    lineHeight: 1.6,
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    roundedSelection: true,
                    contextmenu: false,
                }}
            />
        </div>
    );
};

export default CodeEditor;
