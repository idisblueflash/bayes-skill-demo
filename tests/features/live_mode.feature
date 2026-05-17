# language: zh-TW
功能: live_mode 檔案寫入控制
  作為技能開發者
  我想確保 live_mode 開關能正確控制 bayes_state.json 的寫入
  以便社群使用者不會意外產生本地檔案

  場景: live_mode 關閉時不應寫入任何檔案
    假設 live_mode 為 false
    而且 已提供單條證據場景
    當 執行技能分析
    那麼 bayes_state.json 不應被寫入

  場景: live_mode 開啟時應寫入 bayes_state.json
    假設 live_mode 為 true
    而且 已提供單條證據場景
    當 執行技能分析
    那麼 bayes_state.json 應被寫入
