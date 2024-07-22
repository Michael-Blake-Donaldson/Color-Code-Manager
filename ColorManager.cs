using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Windows;

namespace ColorCodeWebViewApp
{
    public class ColorManager
    {
        private const string FilePath = "colorTemplates.json";

        public void SaveTemplates(List<ColorTemplate> templates)
        {
            try
            {
                var json = JsonSerializer.Serialize(templates, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(FilePath, json);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving templates: {ex.Message}");
            }
        }

        public List<ColorTemplate> LoadTemplates()
        {
            try
            {
                if (File.Exists(FilePath))
                {
                    var json = File.ReadAllText(FilePath);
                    return JsonSerializer.Deserialize<List<ColorTemplate>>(json);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading templates: {ex.Message}");
            }
            return new List<ColorTemplate>();
        }
    }
}