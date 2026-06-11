Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\Public\Emma Project\chrome_ex\apps\frontend"
shell.Run """C:\Program Files\nodejs\node.exe"" serve-current-app-4373.mjs", 0, False
