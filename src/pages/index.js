import React, { useState } from 'react'
import SEO from '../components/seo'
import Editor from '../components/editor'
import '../style.css'
import Settings from '../components/settings'
import Output from '../components/output'

const IndexPage = () => {
  const [cssTree, setCssTree] = useState([])
  const [finalResHtml, setFinalResHtml] = useState('')
  const [finalResCss, setFinalResCss] = useState('')
  const [editorErrors, setEditorErrors] = useState(false)
  const [settings, setSettings] = useState({
    remConversion: 16,
    autoConvertSpacing: true,
    autoConvertColor: true
  })
  const finalRes = (val) => {
    setFinalResHtml(val)
  }
  const finalCss = (val) => {
    setFinalResCss(val)
  }
  return (
    
        <div
            className="h-screen w-screen max-w-full overflow-hidden flex relative"
            style={{ minWidth: '812px' }}
        >
            <Editor setCssTree={setCssTree} setEditorErrors={setEditorErrors} finalRes={finalRes} finalCss={finalCss}/>
            <SEO
                title="Convert Css To Tailwind"
                meta={[
                  {
                    name: 'google-site-verification',
                    content: 'MiBwrqoOFZRpmJ4Ar52jHqGy91bRDEdXqFiUZS9pxB8'
                  }
                ]}
            />
            <div className="flex flex-col h-full flex-grow relative">
                <Output
                    cssTree={cssTree}
                    settings={settings}
                    editorErrors={editorErrors}
                />
            </div>
            <div className="flex flex-col h-full flex-grow relative" style={{fontSize:'10px', maxWidth: '40% !important'}}>
                FINAL HTML
                <div className="row" style={{border:'1px solid', marginBottom:'5px'}}>
                    {finalResHtml}
                </div>

                FINAL CSS
                <div className="row" style={{border:'1px solid'}}>
                    {finalResCss}
                </div>
            </div>
        </div>
  )
}

export default IndexPage
