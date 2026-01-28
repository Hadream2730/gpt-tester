$(function () {
    var gpt_4_1_item = null;
    var gpt_5_1_item = null;
    var chatHistory = []; // Store chat messages
    var currentSystemInstruction = '';
    $('#problem-number').val('1523');

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
    outputDiv.innerHTML = gpt_4_1_item.problem;
    
    // Add the text to be rendered
    // const textNode = document.createTextNode(text);
    // outputDiv.appendChild(textNode);
    
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
    outputDiv.innerHTML = gpt_4_1_item.solution;
    
    // Add the text to be rendered
    // const textNode = document.createTextNode(text);
    // outputDiv.appendChild(textNode);
    
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
    outputDiv.innerHTML = "$" + gpt_4_1_item.answers + "$";
    
    // Add the text to be rendered
    // const textNode = document.createTextNode(text);
    // outputDiv.appendChild(textNode);
    
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
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    messageDiv.appendChild(contentDiv);
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
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '<div class="chat-welcome"><p>👋 Start a conversation! Submit the problem first, then ask questions about the result.</p></div>';
    $('#chat-input').val('');
    $('#send-chat-button').prop('disabled', true);
  }
  
  function display_model2_output() {
    let outputDiv = document.getElementById('model2-display');
    outputDiv.innerHTML = gpt_5_1_item.completion;
    
    // Add the text to be rendered
    // const textNode = document.createTextNode(text);
    // outputDiv.appendChild(textNode);
    
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
            const response = await fetch("https://gpt-test-backend.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    system: currentSystemInstruction,
                    messages: [
                        { role: "user", content: gpt_4_1_item.problem }
                    ]
                })
            });

            const data = await response.json();
            removeLoadingMessage();
            
            if (data.error) {
                addChatMessage('assistant', `<p style="color: red;">Error: ${data.message || 'Unknown error occurred'}</p>`);
            } else {
                let result = data.content[0].content[0].text;
                addChatMessage('assistant', result);
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
        const hasHistory = chatHistory.length > 0;
        $('#send-chat-button').prop('disabled', !hasText || !hasHistory);
    });

    async function sendChatMessage() {
        const chatInput = $('#chat-input');
        const message = chatInput.val().trim();
        
        if (!message || chatHistory.length === 0) {
            return;
        }

        // Disable input while sending
        chatInput.prop('disabled', true);
        $('#send-chat-button').prop('disabled', true);

        // Add user message
        addChatMessage('user', message);
        chatInput.val('');
        showLoadingMessage();

        // Build messages array for API
        const apiMessages = chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        try {
            const response = await fetch("https://gpt-test-backend.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    system: currentSystemInstruction,
                    messages: apiMessages
                })
            });

            const data = await response.json();
            removeLoadingMessage();
            
            if (data.error) {
                addChatMessage('assistant', `<p style="color: red;">Error: ${data.message || 'Unknown error occurred'}</p>`);
            } else {
                let result = data.content[0].content[0].text;
                addChatMessage('assistant', result);
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
});