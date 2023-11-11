class <%= componentNameCamelized %> {

    // values set by command line arguments
    ID = <%= id %>;
    NAME = '<%= name %>';

    // values read from source file (component inputs)
<%
    // This structural javascript iterates over the array "inputStrings".
    // Expression placeholders print each string
    // and add a line break unless it is the last entry.
    for (let i of arrayWithIsLast(inputStrings)) {
        const linebreak = !i.isLast ? '\n' : '';

%>    <%= i.value %><%= linebreak %><%

    }
%>
}
