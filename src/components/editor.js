// https://github.com/scniro/react-codemirror2/issues/83
import React, { useState, useEffect } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/search/match-highlighter'
import parseCSS from 'css-rules'
import { css } from 'js-beautify'
import CSSLint from 'csslint'
import 'codemirror/mode/css/css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/css-lint.js'
import _ from 'lodash'

if (typeof window !== 'undefined') {
  window.CSSLint = CSSLint.CSSLint
}

const initialEditorOptions = {
  value: `/* DELETE ME TO EXECUTE */

example1 {
  height: 5px;
}`,
  data: {},
  editor: {}
}

const debouncedUpdateTree = _.debounce(
  (setCssTree, parse, value, setEditorErrors, errors) => {
    setCssTree(parse(value))
    setEditorErrors(errors)
  },
  500
)

const handleCssFileModifiers = _.debounce(
  (mainFile, finalCss) => {
    var newCssArray = [];
    var finalCssArray;
    const convertedCss = mainFile.data
    let cssArray = convertedCss.split('.hash-')
    cssArray = cssArray.map(css => css.split('{'))    
    const finalTailwindCss = JSON.parse(localStorage.getItem('finalTailwindCss'))
    finalTailwindCss.map((val, index) => {
      if(val.errors.length > 0) {
        let checkKey = cssArray.findIndex(css => {
          return 'hash-'+css[0].trim() == val.identifier.trim()
        })
        if(checkKey != -1){
          if(newCssArray.indexOf(cssArray[checkKey]) === -1) {
            newCssArray.push(cssArray[checkKey]);
          }
        }
        finalCssArray = newCssArray.map(e => {
          return '.hash-' + e[0] + '{' + e[1]
        })
      }
    })
    finalCss(finalCssArray.join('\n'))
  },
  2000
)
const handleHtmlFileModifiers = _.debounce(
  (mainFile, finalRes, allStyle, finalCss) => {
    let convertedHtml = mainFile.data
    const finalTailwindCss = JSON.parse(localStorage.getItem('finalTailwindCss'))
    finalTailwindCss.map((val, index) => {
      if (val.errors.length > 0) {
        convertedHtml = convertedHtml.replaceAll(val.identifier, val.identifier + ' ' + val.value)
      } else {
        convertedHtml = convertedHtml.replaceAll(val.identifier, val.value)
      }
    })
    localStorage.setItem('convertedHtml', convertedHtml)
    finalRes(convertedHtml)
    handleCssFileModifiers(allStyle, finalCss)
  },
  2500
)

const Editor = ({ setCssTree, setEditorErrors, finalRes, finalCss }) => {
  const [editorState, setEditorState] = useState(initialEditorOptions)
  const tidy = () => {
    try {
      setEditorState(() => {
        return {
          ...editorState,
          value: css(editorState.value)
        }
      })
    } catch (e) {
      console.log('error formatting', e)
    }
  }
  const parse = (cssString) => {
    try {
      const parsedVal = parseCSS(cssString)
      return parsedVal
    } catch (e) {
      console.error('error parsing CSS', e)
    }
  }

  return (
        <div className="relative h-full w-4/12">
            <div
                className="absolute top-0 right-0 m-2 z-10 cursor-pointer text-gray-500 hover:text-gray-100"
                onClick={() => {
                  tidy()
                }}
            >
                <div className="font-bold" style={{ fontSize: '0.5rem' }}>
                    TIDY
                </div>
                <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="w-6 h-4"
                >
                    <path d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
            </div>
            {typeof window !== 'undefined' && window.navigator && (
                <CodeMirror
                    value={editorState.value}
                    options={{
                      mode: 'css',
                      theme: 'material',
                      lineNumbers: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      gutters: ['CodeMirror-lint-markers'],
                      lint: true
                    }}
                    id="my-codemirror-2"
                    onBeforeChange={(editor, data, value) => {
                      setEditorState({ editor, data, value })
                    }}
                    editorDidMount={(editor, [next]) => {
                      debouncedUpdateTree(
                        setCssTree,
                        parse,
                        initialEditorOptions.value,
                        setEditorErrors,
                        editor.state.lint.marked.length > 0
                      )
                    }}
                    onChange={async (editor, data, value) => {
                      const style = await fetch('http://localhost:3000/getStyle')
                      const html = await fetch('http://localhost:3000/getHtml')
                      const allStyle = await style.json()
                      const allHtml = await html.json()
                      debouncedUpdateTree(
                        setCssTree,
                        parse,
                        allStyle.data,
                        setEditorErrors,
                        editor.state.lint.marked.length > 0
                      )
                      // handleCssFileModifiers(allStyle, finalCss)
                      handleHtmlFileModifiers(allHtml, finalRes, allStyle, finalCss)
                      // setCssTree(parse(value));
                      // setEditorErrors(editor.state.lint.marked.length > 0);
                      // console.log(editor, data, parse(value));
                    }}
                />
            )}
        </div>
  )
}

export default Editor
