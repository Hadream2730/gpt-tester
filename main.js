$(function () {
    var gpt_4_1_item = null;
    var gpt_5_1_item = null;
    var chatHistory = []; // Store chat messages
    var currentSystemInstruction = '';
    var currentConversationId = null; // Store conversation_id for stateful conversations
    $('#problem-number').val('1523');

    // Store original text before markdown/KaTeX processing
    var originalTexts = {
        problem: '',
        solution: '',
        answer: ''
    };

    // Helper function to protect LaTeX before markdown processing
    function protectLatex(text) {
      if (!text) return { text: '', latexBlocks: [] };
      
      const latexBlocks = [];
      let counter = 0;
      
      // Protect $$ blocks first (display math)
      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
        const placeholder = `__LATEX_DISPLAY_${counter}_PLACEHOLDER__`;
        latexBlocks.push({ content: match });
        counter++;
        return placeholder;
      });
      
      // Protect \[ \] blocks (display math)
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match) => {
        const placeholder = `__LATEX_DISPLAY_${counter}_PLACEHOLDER__`;
        latexBlocks.push({ content: match });
        counter++;
        return placeholder;
      });
      
      // Protect \( \) blocks (inline math)
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match) => {
        const placeholder = `__LATEX_INLINE_${counter}_PLACEHOLDER__`;
        latexBlocks.push({ content: match });
        counter++;
        return placeholder;
      });
      
      // Protect $ blocks (inline math) - must be last, after $$ is protected
      text = text.replace(/\$([^\$\n]+?)\$/g, (match) => {
        if (match.includes('__LATEX_')) return match;
        const placeholder = `__LATEX_INLINE_${counter}_PLACEHOLDER__`;
        latexBlocks.push({ content: match });
        counter++;
        return placeholder;
      });
      
      return { text, latexBlocks };
    }
    
    // Helper function to restore LaTeX after markdown processing
    function restoreLatex(html, latexBlocks) {
      if (!html || !latexBlocks || latexBlocks.length === 0) return html;
      let result = html;
      latexBlocks.forEach((block, index) => {
        // Try both with and without underscores (marked.js might preserve them differently than markdown-it)
        const displayPatterns = [`LATEX_DISPLAY_${index}_PLACEHOLDER__`, `LATEX_DISPLAY_${index}_PLACEHOLDER`];
        const inlinePatterns = [`__LATEX_INLINE_${index}_PLACEHOLDER__`, `LATEX_INLINE_${index}_PLACEHOLDER`];
        
        displayPatterns.forEach(pattern => {
          result = result.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), block.content);
        });
        inlinePatterns.forEach(pattern => {
          result = result.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), block.content);
        });
      });
      return result;
    }

    function displayAll() {
        const problem_number = $('#problem-number').val();
        console.log('Problem Number:', problem_number);
        gpt_4_1_item = get_gpt_4_1_from_index(problem_number);
        gpt_5_1_item = get_gpt_5_1_from_index(problem_number);
        console.log('GPT-4.1 Item:', gpt_4_1_item);
        console.log('GPT-5.1 Item:', gpt_5_1_item);
        display_problem();
        display_solution();
        display_answer();
    }

  $('#display-button').click(function () {
      displayAll();
  });
  $('#prev-button').click(function () {
      showPrevious();
  });
  $('#next-button').click(function () {
      showNext();
  });
  $('#problem-number').on('keypress', function (e) {
      if (e.which === 13) { // Enter key pressed
          displayAll();
      }
  });
  function showNext() {
    const problem_number = $('#problem-number').val();
    let next_problem_number = 0;
    for(let i=0; i < gpt_4_1_data.length; i++) {
        if(gpt_4_1_data[i].index == problem_number) {
            if(i == gpt_4_1_data.length - 1) {
                next_problem_number = gpt_4_1_data[0].index;
                break;
            }
            next_problem_number =  gpt_4_1_data[i+1].index;
            break;
        }
    }
    $('#problem-number').val(next_problem_number);
    displayAll(next_problem_number);
  }
  function showPrevious() {
    const problem_number = $('#problem-number').val();
    let previous_problem_number = 0;
    for(let i=0; i < gpt_4_1_data.length; i++) {
        if(gpt_4_1_data[i].index == problem_number) {
            if(i == 0) {
                previous_problem_number = gpt_4_1_data[gpt_4_1_data.length - 1].index;
                break;
            }
            previous_problem_number =  gpt_4_1_data[i-1].index;
            break;
        }
    }
    $('#problem-number').val(previous_problem_number);
    displayAll(previous_problem_number);
}

  function get_gpt_4_1_from_index(index) {
    for(let i=0; i < gpt_4_1_data.length; i++) {
        if(gpt_4_1_data[i].index == index) {
            return gpt_4_1_data[i]
        }
    }
  }
  function get_gpt_5_1_from_index(index) {
    for(let i=0; i < gpt_5_1_data.length; i++) {
        if(gpt_5_1_data[i].index == index) {
            return gpt_5_1_data[i]
        }
    }
  }
  function display_problem() {
    let outputDiv = document.getElementById('problem-display');
    // Store original text before processing
    originalTexts.problem = gpt_4_1_item.problem;
    const { text: protectedText, latexBlocks } = protectLatex(gpt_4_1_item.problem);
    const markdownHtml = typeof marked !== 'undefined' ? marked.parse(protectedText) : protectedText;
    outputDiv.innerHTML = restoreLatex(markdownHtml, latexBlocks);
    
    // Render the KaTeX
    try {
        renderMathInElement(outputDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true}
            ],
            throwOnError: false,
            strict: false
        });
    } catch (error) {
        outputDiv.innerHTML = '<div style="color: red;">Error rendering KaTeX: ' + error.message + '</div>';
    }
  }

  
  function display_solution() {
    let outputDiv = document.getElementById('solution-display');
    // Store original text before processing
    originalTexts.solution = gpt_4_1_item.solution;
    const { text: protectedText, latexBlocks } = protectLatex(gpt_4_1_item.solution);
    const markdownHtml = typeof marked !== 'undefined' ? marked.parse(protectedText) : protectedText;
    outputDiv.innerHTML = restoreLatex(markdownHtml, latexBlocks);
    
    // Render the KaTeX
    try {
        renderMathInElement(outputDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true}
            ],
            throwOnError: false,
            strict: false
        });
    } catch (error) {
        outputDiv.innerHTML = '<div style="color: red;">Error rendering KaTeX: ' + error.message + '</div>';
    }
  }

  
  function display_answer() {
    let outputDiv = document.getElementById('answer-display');
    // Store original text before processing (without the $ wrapper for copying)
    originalTexts.answer = gpt_4_1_item.answers;
    // Answer is already wrapped in $ delimiters, so protect it
    const answerText = "$" + gpt_4_1_item.answers + "$";
    const { text: protectedText, latexBlocks } = protectLatex(answerText);
    // Answer might not need markdown, but apply it anyway for consistency
    const markdownHtml = typeof marked !== 'undefined' ? marked.parse(protectedText) : protectedText;
    outputDiv.innerHTML = restoreLatex(markdownHtml, latexBlocks);
    
    // Render the KaTeX
    try {
        renderMathInElement(outputDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true}
            ],
            throwOnError: false,
            strict: false
        });
    } catch (error) {
        outputDiv.innerHTML = '<div style="color: red;">Error rendering KaTeX: ' + error.message + '</div>';
    }
  }

  
  function addChatMessage(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    
    // Remove welcome message if it exists
    const welcome = chatMessages.querySelector('.chat-welcome');
    if (welcome) {
      welcome.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    // Store original content in data attribute for copying
    messageDiv.setAttribute('data-original-content', content);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Process markdown and LaTeX
    const { text: protectedText, latexBlocks } = protectLatex(content);
    const markdownHtml = typeof marked !== 'undefined' ? marked.parse(protectedText) : protectedText;
    contentDiv.innerHTML = restoreLatex(markdownHtml, latexBlocks);
    
    // Create copy button for this message
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn-chat';
    copyBtn.title = 'Copy original text';
    copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    
    // Add click handler for this copy button
    copyBtn.addEventListener('click', function() {
      const originalText = messageDiv.getAttribute('data-original-content');
      if (originalText) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(originalText).then(function() {
            showCopyFeedback($(copyBtn));
            downloadAsJson(originalText, 'chat-message');
          }).catch(function() {
            if (copyToClipboard(originalText)) {
              showCopyFeedback($(copyBtn));
              downloadAsJson(originalText, 'chat-message');
            }
          });
        } else {
          if (copyToClipboard(originalText)) {
            showCopyFeedback($(copyBtn));
            downloadAsJson(originalText, 'chat-message');
          }
        }
      }
    });
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(copyBtn);
    chatMessages.appendChild(messageDiv);
    
    // Render KaTeX in the new message
    try {
        renderMathInElement(contentDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true}
            ],
            throwOnError: false,
            strict: false
        });
    } catch (error) {
        contentDiv.innerHTML = '<div style="color: red;">Error rendering KaTeX: ' + error.message + '</div>';
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to chat history
    chatHistory.push({ role, content });
  }

  function showLoadingMessage() {
    const chatMessages = document.getElementById('chat-messages');
    const welcome = chatMessages.querySelector('.chat-welcome');
    if (welcome) {
      welcome.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant';
    messageDiv.id = 'loading-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<div class="loading-indicator"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeLoadingMessage() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
      loadingMsg.remove();
    }
  }

  function clearChat() {
    chatHistory = [];
    currentConversationId = null; // Clear conversation_id when starting fresh
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '<div class="chat-welcome"><p>👋 Start a conversation! Type a message below, or submit a problem above to chat about it.</p></div>';
    $('#chat-input').val('');
    $('#send-chat-button').prop('disabled', true);
  }

  function parseResponseContent(content) {
    // Handle different response structures from the API
    if (Array.isArray(content) && content.length > 0) {
      // Check if it's the nested structure: [{content: [{text: "..."}]}]
      if (content[0].content && Array.isArray(content[0].content) && content[0].content.length > 0) {
        return content[0].content[0].text || content[0].content[0];
      }
      // Check if it's an array of strings
      if (typeof content[0] === 'string') {
        return content[0];
      }
      // Check if it's an array of objects with text property
      if (content[0].text) {
        return content[0].text;
      }
      // Fallback: stringify if we can't parse
      return JSON.stringify(content);
    }
    // If content is a string directly
    if (typeof content === 'string') {
      return content;
    }
    // Fallback: stringify
    return JSON.stringify(content);
  }
  
  function display_model2_output() {
    let outputDiv = document.getElementById('model2-display');
    const { text: protectedText, latexBlocks } = protectLatex(gpt_5_1_item.completion);
    const markdownHtml = typeof marked !== 'undefined' ? marked.parse(protectedText) : protectedText;
    outputDiv.innerHTML = restoreLatex(markdownHtml, latexBlocks);
    
    // Render the KaTeX
    try {
        renderMathInElement(outputDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true},
                {left: "\\begin{equation}", right: "\\end{equation}", display: true},
                {left: "\\begin{align}", right: "\\end{align}", display: true},
                {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
                {left: "\\begin{gather}", right: "\\end{gather}", display: true},
                {left: "\\begin{CD}", right: "\\end{CD}", display: true}
            ],
            throwOnError: false,
            strict: false
        });
    } catch (error) {
        outputDiv.innerHTML = '<div style="color: red;">Error rendering KaTeX: ' + error.message + '</div>';
    }
  }

  $('#submit-button').click(async function () {
        if (!gpt_4_1_item) {
            alert('Please display a problem first!');
            return;
        }

        console.log('Submit is clicked');
        const submitBtn = $('#submit-button');
        const btnText = submitBtn.find('.btn-text');
        const btnLoader = submitBtn.find('.btn-loader');
        
        submitBtn.prop('disabled', true);
        btnText.hide();
        btnLoader.show();

        // Clear previous chat and start fresh
        clearChat();
        currentSystemInstruction = $('#system-instruction').val();
        
        // Add user message (the problem)
        addChatMessage('user', gpt_4_1_item.problem);
        showLoadingMessage();

        try {
            const modelName = ($('#model-name').val() || '').trim() || 'gpt-4.1-mini';
            const requestBody = {
                system: currentSystemInstruction,
                messages: [
                    { role: "user", content: gpt_4_1_item.problem }
                ],
                model: modelName
            };
            
            // Don't send conversation_id for the first message (starting new conversation)
            // The API will return a conversation_id that we'll use for subsequent messages

            const response = await fetch("https://gpt-test-backend.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            removeLoadingMessage();
            
            if (!response.ok || data.error || data.detail?.error) {
                const errorMsg = data.detail?.message || data.message || data.detail?.detail || 'Unknown error occurred';
                addChatMessage('assistant', `<p style="color: red;">Error: ${errorMsg}</p>`);
            } else {
                let result = parseResponseContent(data.content);
                addChatMessage('assistant', result);
                
                // Store conversation_id for subsequent messages
                if (data.conversation_id) {
                    currentConversationId = data.conversation_id;
                }
            }
        } catch (error) {
            removeLoadingMessage();
            addChatMessage('assistant', `<p style="color: red;">Error: ${error.message}</p>`);
        } finally {
            submitBtn.prop('disabled', false);
            btnText.show();
            btnLoader.hide();
        }
    });

    // Chat input functionality
    $('#send-chat-button').click(async function () {
        await sendChatMessage();
    });

    $('#chat-input').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    $('#chat-input').on('input', function() {
        const hasText = $(this).val().trim().length > 0;
        $('#send-chat-button').prop('disabled', !hasText);
    });

    async function sendChatMessage() {
        const chatInput = $('#chat-input');
        const message = chatInput.val().trim();
        
        if (!message) {
            return;
        }

        // Disable input while sending
        chatInput.prop('disabled', true);
        $('#send-chat-button').prop('disabled', true);

        // Add user message
        addChatMessage('user', message);
        chatInput.val('');
        showLoadingMessage();

        // System: use current (set by Submit) or fallback to textarea for standalone chat
        const systemInstruction = currentSystemInstruction || $('#system-instruction').val() || '';
        const modelName = ($('#model-name').val() || '').trim() || 'gpt-4.1-mini';

        // Build request body
        const requestBody = {
            system: systemInstruction,
            messages: [
                { role: "user", content: message }
            ],
            model: modelName
        };
        
        // If we have a conversation_id (e.g. after Submit or previous messages), use it
        if (currentConversationId) {
            requestBody.conversation_id = currentConversationId;
        } else {
            // New conversation: send full history so API has context (or just this message)
            requestBody.messages = chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        }

        try {
            const response = await fetch("https://gpt-test-backend.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            removeLoadingMessage();
            
            if (!response.ok || data.error || data.detail?.error) {
                const errorMsg = data.detail?.message || data.message || data.detail?.detail || 'Unknown error occurred';
                addChatMessage('assistant', `<p style="color: red;">Error: ${errorMsg}</p>`);
            } else {
                let result = parseResponseContent(data.content);
                addChatMessage('assistant', result);
                
                // Update conversation_id if provided (should be same or new one)
                if (data.conversation_id) {
                    currentConversationId = data.conversation_id;
                }
            }
        } catch (error) {
            removeLoadingMessage();
            addChatMessage('assistant', `<p style="color: red;">Error: ${error.message}</p>`);
        } finally {
            chatInput.prop('disabled', false);
            chatInput.focus();
        }
    }

    // Clear chat button
    $('#clear-chat-button').click(function() {
        clearChat();
    });

    // Copy functionality (fallback for older browsers)
    function copyToClipboard(text) {
        if (!text) {
            return false;
        }
        
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            return successful;
        } catch (err) {
            document.body.removeChild(textarea);
            return false;
        }
    }

    // Download copied text as a JSON file
    function downloadAsJson(text, filenameBase) {
        if (!text) return;
        const payload = { text: text };
        const jsonString = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (filenameBase || 'copy') + '-' + Date.now() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Copy button event handlers
    $('.copy-btn').click(function() {
        const $button = $(this);
        const target = $button.data('copy-target');
        const originalText = originalTexts[target];
        
        if (originalText) {
            // Use modern clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(originalText).then(function() {
                    showCopyFeedback($button);
                    downloadAsJson(originalText, target);
                }).catch(function() {
                    // Fallback to execCommand
                    if (copyToClipboard(originalText)) {
                        showCopyFeedback($button);
                        downloadAsJson(originalText, target);
                    }
                });
            } else {
                // Fallback to execCommand
                if (copyToClipboard(originalText)) {
                    showCopyFeedback($button);
                    downloadAsJson(originalText, target);
                }
            }
        }
    });

    function showCopyFeedback($button) {
        const originalHtml = $button.html();
        $button.addClass('copied');
        $button.html('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>');
        
        setTimeout(function() {
            $button.removeClass('copied');
            $button.html(originalHtml);
        }, 2000);
    }
});