
import React, { useMemo } from 'react';
import { Bhajan, ScriptType } from '../types';
import { ChevronRight, User } from 'lucide-react';

interface CategoryListProps {
  bhajans: Bhajan[];
  onSelect: (bhajan: Bhajan) => void;
  script: ScriptType;
}

export const CategoryList: React.FC<CategoryListProps> = ({ bhajans, onSelect, script }) => {
  
  const groupedData = useMemo(() => {
    const groups: Record<string, Bhajan[]> = {};
    const miscKey = "Miscellaneous"; // Internal key, displayed differently based on script

    bhajans.forEach(bhajan => {
      // Group by Devanagari author name as the unique ID
      const key = bhajan.author || miscKey;
      if (!groups[key]) groups[key] = [];
      groups[key].push(bhajan);
    });

    // Sort authors alphabetically
    const keys = Object.keys(groups).sort((a, b) => {
        if (a === miscKey) return 1;
        if (b === miscKey) return -1;
        return a.localeCompare(b);
    });

    return { groups, keys, miscKey };
  }, [bhajans]);

  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  // Helper to determine what to display for the Group Header based on script
  const getCategoryDisplayName = (key: string) => {
    if (key === groupedData.miscKey) {
       return script === 'iast' ? 'Miscellaneous' : 'विविध';
    }
    
    // Find the first bhajan in this group to get the author translations
    const representative = groupedData.groups[key][0];
    if (!representative) return key;

    if (script === 'iast') {
      return representative.authorIAST || representative.author || key;
    } else {
      return representative.author || key;
    }
  };

  return (
    <div className="pb-24 pt-2">
      {groupedData.keys.map(categoryKey => (
        <div key={categoryKey} className="mb-2 bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700">
          <button
            onClick={() => toggleCategory(categoryKey)}
            className="w-full flex items-center justify-between p-4 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-saffron-100 dark:bg-slate-700 text-saffron-600 dark:text-saffron-400 flex items-center justify-center">
                 <User size={16} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 font-hindi">
                    {getCategoryDisplayName(categoryKey)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {groupedData.groups[categoryKey].length} {script === 'iast' ? 'Songs' : 'भजन'}
                  </p>
               </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedCategory === categoryKey ? 'rotate-90' : ''}`} />
          </button>

          {expandedCategory === categoryKey && (
             <ul className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
               {groupedData.groups[categoryKey].map(bhajan => (
                 <li key={bhajan.id}>
                   <button
                     onClick={() => onSelect(bhajan)}
                     className="w-full text-left py-3 px-4 pl-14 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors"
                   >
                      <div className="font-hindi text-slate-700 dark:text-slate-200 font-medium">
                         {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                      </div>
                      <div className="text-xs text-slate-400 font-hindi mt-0.5 truncate">
                         {script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine}
                      </div>
                   </button>
                 </li>
               ))}
             </ul>
          )}
        </div>
      ))}
    </div>
  );
};
