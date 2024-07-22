using System.Collections.Generic;

namespace ColorCodeWebViewApp
{
    public class ColorTemplate
    {
        public string Name { get; set; }
        public List<string> ColorCodes { get; set; } = new List<string>();

        public ColorTemplate(string name)
        {
            Name = name;
        }

        public void AddColorCode(string colorCode)
        {
            ColorCodes.Add(colorCode);
        }

        public override string ToString()
        {
            return $"Template Name: {Name}, Color Codes: {string.Join(", ", ColorCodes)}";
        }
    }
}