alias notebooks='cd ~/Repositories/notebooks'
alias hw='cd ~/Repositories/UBC/cpsc330-2024s/hw'
alias 330='cd ~/Repositories/UBC/cpsc330-2024s'
alias 330update='cd ~/Repositories/UBC/cpsc330-2024s/hw && git pull'
alias jn='jupyter notebook'
alias jl='jupyter lab'
alias repos='cd ~/Repositories'
alias gpt='cd ~/Repositories/TypeGPT && source myenv/bin/activate && nohup python3 TypeGPT.py > gpt.log 2>&1 &'



# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<


# pnpm
export PNPM_HOME="/Users/alexolyaiy/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

function gp() {
    git add .
    git commit -m "$1"
    git push
}
