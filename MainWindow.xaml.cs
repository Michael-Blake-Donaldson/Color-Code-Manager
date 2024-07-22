using System;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace ColorCodeWebViewApp
{
    public partial class MainWindow : Window
    {
        private ColorManager colorManager;

        public MainWindow()
        {
            try
            {
                InitializeComponent();
                InitializeAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Initialization Exception");
            }
        }

        private async void InitializeAsync()
        {
            try
            {
                await webView.EnsureCoreWebView2Async(null);
                webView.CoreWebView2.WebMessageReceived += WebView_WebMessageReceived;
                colorManager = new ColorManager();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Async Initialization Exception");
            }
        }

        private void WebView_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            var message = JsonSerializer.Deserialize<WebMessage>(e.WebMessageAsJson);
            switch (message.Command)
            {
                case "saveTemplates":
                    colorManager.SaveTemplates(message.Templates);
                    break;
                case "loadTemplates":
                    var templates = colorManager.LoadTemplates();
                    var json = JsonSerializer.Serialize(new { command = "loadTemplates", templates });
                    webView.CoreWebView2.PostWebMessageAsJson(json);
                    break;
            }
        }
    }

    public class WebMessage
    {
        public string Command { get; set; }
        public List<ColorTemplate> Templates { get; set; }
    }
}