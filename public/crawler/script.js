document.addEventListener('DOMContentLoaded', function () {
    // Lấy các phần tử DOM
    const htmlInput = document.getElementById('htmlInput');
    const convertBtn = document.getElementById('convertBtn');
    const tablePreview = document.getElementById('tablePreview');
    const csvOutput = document.getElementById('csvOutput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Thêm nút sao chép cho Excel
    const copyExcelBtn = document.createElement('button');
    copyExcelBtn.id = 'copyExcelBtn';
    copyExcelBtn.textContent = 'Sao chép cho Excel';

    // Chèn nút vào giữa nút sao chép CSV và nút tải xuống
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons.insertBefore(copyExcelBtn, downloadBtn);

    // Thêm CSS cho nút mới
    const style = document.createElement('style');
    style.textContent = `
    #copyExcelBtn {
      background-color: #9b59b6;
    }
    
    #copyExcelBtn:hover {
      background-color: #8e44ad;
    }
  `;
    document.head.appendChild(style);

    // Xử lý sự kiện khi nhấn nút chuyển đổi
    convertBtn.addEventListener('click', function () {
        const htmlContent = htmlInput.value.trim();

        if (!htmlContent) {
            alert('Vui lòng nhập mã HTML của bảng!');
            return;
        }

        try {
            // Hiển thị bảng trong phần xem trước
            tablePreview.innerHTML = htmlContent;

            // Chuyển đổi bảng thành CSV
            const csvContent = convertTableToCSV(tablePreview.querySelector('table'));

            // Hiển thị kết quả CSV
            csvOutput.value = csvContent;
        } catch (error) {
            alert('Có lỗi xảy ra khi chuyển đổi: ' + error.message);
            console.error(error);
        }
    });

    // Xử lý sự kiện khi nhấn nút sao chép
    copyBtn.addEventListener('click', function () {
        if (!csvOutput.value) {
            alert('Không có dữ liệu CSV để sao chép!');
            return;
        }

        csvOutput.select();
        document.execCommand('copy');

        // Thông báo đã sao chép
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Đã sao chép!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });

    // Xử lý sự kiện khi nhấn nút sao chép cho Excel
    copyExcelBtn.addEventListener('click', function () {
        const table = tablePreview.querySelector('table');

        if (!table) {
            alert('Không có bảng để sao chép!');
            return;
        }

        try {
            // Tạo HTML đặc biệt cho Excel
            const excelHTML = convertTableToExcelHTML(table);

            // Sử dụng Clipboard API để sao chép với nhiều định dạng
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = new Blob([excelHTML], { type: 'text/html' });
                const clipboardItem = new ClipboardItem({
                    'text/html': blob
                });

                navigator.clipboard.write([clipboardItem]).then(() => {
                    // Thông báo đã sao chép
                    const originalText = copyExcelBtn.textContent;
                    copyExcelBtn.textContent = 'Đã sao chép!';
                    setTimeout(() => {
                        copyExcelBtn.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Lỗi khi sao chép:', err);
                    fallbackCopyForExcel(excelHTML);
                });
            } else {
                // Fallback cho trình duyệt không hỗ trợ Clipboard API
                fallbackCopyForExcel(excelHTML);
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi sao chép: ' + error.message);
            console.error(error);
        }
    });

    // Xử lý sự kiện khi nhấn nút tải xuống
    downloadBtn.addEventListener('click', function () {
        if (!csvOutput.value) {
            alert('Không có dữ liệu CSV để tải xuống!');
            return;
        }

        // Tạo blob từ nội dung CSV
        const blob = new Blob([csvOutput.value], { type: 'text/csv;charset=utf-8;' });

        // Tạo URL cho blob
        const url = URL.createObjectURL(blob);

        // Tạo phần tử a để tải xuống
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'data_export.csv');
        link.style.visibility = 'hidden';

        // Thêm phần tử a vào DOM, nhấp vào nó và xóa nó
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Hàm chuyển đổi bảng HTML thành CSV
    function convertTableToCSV(table) {
        if (!table) {
            throw new Error('Không tìm thấy bảng trong HTML đã nhập!');
        }

        const rows = table.querySelectorAll('tr');
        let csvContent = '';

        // Xử lý từng hàng
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('th, td');
            const rowValues = [];

            // Xử lý từng ô trong hàng
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];

                // Kiểm tra nếu có thuộc tính colspan
                if (cell.hasAttribute('colspan')) {
                    const colspan = parseInt(cell.getAttribute('colspan'));

                    // Nếu colspan là một số lớn (như 100000), chỉ thêm một giá trị
                    if (colspan > 100) {
                        let value = getCellValue(cell);
                        rowValues.push(formatCSVValue(value));
                    } else {
                        // Thêm giá trị cho mỗi cột được gộp
                        let value = getCellValue(cell);
                        rowValues.push(formatCSVValue(value));

                        // Thêm các ô trống cho các cột được gộp còn lại
                        for (let k = 1; k < colspan; k++) {
                            rowValues.push('');
                        }
                    }
                } else {
                    // Ô bình thường
                    let value = getCellValue(cell);
                    rowValues.push(formatCSVValue(value));
                }
            }

            // Thêm hàng vào nội dung CSV
            csvContent += rowValues.join(',') + '\n';
        }

        return csvContent;
    }

    // Hàm phân tích kiểu dữ liệu từ giá trị và đơn vị
    function detectDataType(value, unit) {
        // Loại bỏ dấu phẩy ngăn cách hàng nghìn
        const cleanValue = value.replace(/,/g, '');

        // Kiểm tra nếu là số
        if (!isNaN(cleanValue) && cleanValue.trim() !== '') {
            // Kiểm tra nếu là phần trăm
            if (unit === '%') {
                return { type: 'percentage', value: parseFloat(cleanValue) / 100 };
            }
            // Kiểm tra nếu là tiền tệ
            else if (unit.includes('VNĐ') || unit.includes('USD') || unit.includes('Tỷ')) {
                return { type: 'currency', value: parseFloat(cleanValue) };
            }
            // Kiểm tra nếu là số thập phân
            else if (cleanValue.includes('.')) {
                return { type: 'decimal', value: parseFloat(cleanValue) };
            }
            // Số nguyên
            else {
                return { type: 'number', value: parseFloat(cleanValue) };
            }
        }

        // Kiểm tra nếu là ngày tháng
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        if (datePattern.test(value)) {
            return { type: 'date', value: value };
        }

        // Nếu không phải số, trả về kiểu text
        return { type: 'text', value: value };
    }

    // Hàm tạo HTML đặc biệt cho Excel
    function convertTableToExcelHTML(table) {
        if (!table) {
            throw new Error('Không tìm thấy bảng trong HTML đã nhập!');
        }

        // Lưu trữ đơn vị tính cho mỗi cột
        const columnUnits = [];

        // Lấy tất cả hàng
        const rows = table.querySelectorAll('tr');
        let excelHTML = '<table xmlns:x="urn:schemas-microsoft-com:office:excel">';

        // Xử lý từng hàng
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('th, td');
            excelHTML += '<tr>';

            // Xử lý từng ô trong hàng
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                const isHeader = cell.tagName.toLowerCase() === 'th';
                const cellValue = getCellValue(cell);

                // Lưu đơn vị tính
                if (i === 0 && cellValue === 'Đơn vị tính') {
                    // Đây là cột đơn vị tính
                } else if (i > 0 && j === 1 && cell.classList.contains('col-unit')) {
                    // Lưu đơn vị tính cho hàng hiện tại
                    columnUnits[i] = cellValue;
                }

                // Xử lý colspan
                if (cell.hasAttribute('colspan')) {
                    const colspan = parseInt(cell.getAttribute('colspan'));

                    // Nếu colspan quá lớn, chỉ sử dụng 1
                    const effectiveColspan = colspan > 100 ? 1 : colspan;

                    // Thêm thuộc tính colspan vào ô
                    excelHTML += `<${isHeader ? 'th' : 'td'} colspan="${effectiveColspan}">`;
                    excelHTML += formatExcelValue(cellValue, '');
                    excelHTML += `</${isHeader ? 'th' : 'td'}>`;
                } else {
                    // Xác định đơn vị tính cho ô hiện tại
                    let unit = '';

                    // Nếu là ô có giá trị số, tìm đơn vị tính tương ứng
                    if (j >= 2 && i > 0) {
                        // Tìm đơn vị tính từ cột thứ 2 của hàng hiện tại
                        const unitCell = row.querySelector('.col-unit');
                        if (unitCell) {
                            unit = getCellValue(unitCell);
                        }
                    }

                    // Phân tích kiểu dữ liệu
                    const dataInfo = cell.hasAttribute('value') ?
                        detectDataType(cell.getAttribute('value'), unit) :
                        detectDataType(cellValue, unit);

                    // Tạo ô với định dạng phù hợp
                    excelHTML += `<${isHeader ? 'th' : 'td'}`;

                    // Thêm thuộc tính data-t cho Excel nhận biết kiểu dữ liệu
                    if (!isHeader && dataInfo.type !== 'text') {
                        if (dataInfo.type === 'number') {
                            excelHTML += ` x:num="1"`;
                        } else if (dataInfo.type === 'decimal') {
                            excelHTML += ` x:num="1" style="mso-number-format:'0.00'"`;
                        } else if (dataInfo.type === 'percentage') {
                            excelHTML += ` x:num="1" style="mso-number-format:'0.00%'"`;
                        } else if (dataInfo.type === 'currency') {
                            excelHTML += ` x:num="1" style="mso-number-format:'#,##0'"`;
                        } else if (dataInfo.type === 'date') {
                            excelHTML += ` style="mso-number-format:'dd/mm/yyyy'"`;
                        }
                    }

                    excelHTML += '>';

                    // Sử dụng giá trị gốc cho Excel
                    if (cell.hasAttribute('value') && dataInfo.type !== 'text') {
                        excelHTML += cell.getAttribute('value');
                    } else {
                        excelHTML += formatExcelValue(cellValue, unit);
                    }

                    excelHTML += `</${isHeader ? 'th' : 'td'}>`;
                }
            }

            excelHTML += '</tr>';
        }

        excelHTML += '</table>';
        return excelHTML;
    }

    // Hàm định dạng giá trị cho Excel
    function formatExcelValue(value, unit) {
        // Xử lý đặc biệt cho các đơn vị
        if (unit === '%') {
            // Đối với phần trăm, giữ nguyên giá trị
            return value;
        }

        return value;
    }

    // Hàm fallback cho trình duyệt không hỗ trợ Clipboard API
    function fallbackCopyForExcel(html) {
        // Tạo một phần tử tạm thời
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'fixed';
        container.style.pointerEvents = 'none';
        container.style.opacity = '0';
        document.body.appendChild(container);

        // Chọn nội dung
        window.getSelection().removeAllRanges();
        const range = document.createRange();
        range.selectNode(container);
        window.getSelection().addRange(range);

        // Sao chép
        document.execCommand('copy');

        // Dọn dẹp
        window.getSelection().removeAllRanges();
        document.body.removeChild(container);

        // Thông báo
        const originalText = copyExcelBtn.textContent;
        copyExcelBtn.textContent = 'Đã sao chép!';
        setTimeout(() => {
            copyExcelBtn.textContent = originalText;
        }, 2000);
    }

    // Hàm lấy giá trị từ ô
    function getCellValue(cell) {
        // Nếu có thuộc tính value, sử dụng nó
        if (cell.hasAttribute('value')) {
            return cell.getAttribute('value');
        }

        // Nếu có phần tử div bên trong, lấy nội dung của nó
        const div = cell.querySelector('div');
        if (div) {
            return div.textContent.trim();
        }

        // Nếu không, lấy nội dung văn bản của ô
        return cell.textContent.trim();
    }

    // Hàm định dạng giá trị cho CSV
    function formatCSVValue(value) {
        // Nếu giá trị có dấu phẩy, dấu nháy kép hoặc ký tự xuống dòng, bọc nó trong dấu nháy kép
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            // Thay thế dấu nháy kép bằng hai dấu nháy kép (quy tắc CSV)
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    // Tự động điền dữ liệu mẫu nếu có
    const sampleData = `
  <table class="macro-table" id="tbl-macro-data"><thead><tr><th class="col-title">Chỉ tiêu</th><th class="col-unit">Đơn vị tính</th><th class="text-right">Quý 3/2020</th><th class="text-right">Quý 4/2020</th><th class="text-right">Quý 1/2021</th><th class="text-right">Quý 2/2021</th><th class="text-right">Quý 3/2021</th><th class="text-right">Quý 4/2021</th><th class="text-right">Quý 1/2022</th><th class="text-right">Quý 2/2022</th><th class="text-right">Quý 3/2022</th><th class="text-right">Quý 4/2022</th><th class="text-right">Quý 1/2023</th><th class="text-right">Quý 2/2023</th><th class="text-right">Quý 3/2023</th><th class="text-right">Quý 4/2023</th><th class="text-right">Quý 1/2024</th><th class="text-right">Quý 2/2024</th><th class="text-right">Quý 3/2024</th><th class="text-right">Quý 4/2024</th><th class="text-right">Quý 1/2025</th><th class="text-right">Quý 2/2025</th></tr></thead><tbody><tr class="group"><td colspan="100000" class="label-l1"><div>Giá trị GDP hiện hành</div></td></tr><tr class="row-active"><td class="label-l2 col-title">GDP danh nghĩa</td><td class="text-left col-unit">Tỷ VNĐ</td><td class="text-right" value="1593586">1,593,586</td><td class="text-right" value="2121415">2,121,415</td><td class="text-right" value="1915368">1,915,368</td><td class="text-right" value="2050431">2,050,431</td><td class="text-right" value="1986949">1,986,949</td><td class="text-right" value="2399005">2,399,005</td><td class="text-right" value="2132796">2,132,796</td><td class="text-right" value="2292012">2,292,012</td><td class="text-right" value="2373152">2,373,152</td><td class="text-right" value="2669131">2,669,131</td><td class="text-right" value="2300882">2,300,882</td><td class="text-right" value="2444649">2,444,649</td><td class="text-right" value="2540588">2,540,588</td><td class="text-right" value="2921187">2,921,187</td><td class="text-right" value="2513091">2,513,091</td><td class="text-right" value="2727565">2,727,565</td><td class="text-right" value="2894998">2,894,998</td><td class="text-right" value="3297408">3,297,408</td><td class="text-right" value="2809099">2,809,099</td><td class="text-right" value="3091123">3,091,123</td></tr><tr class="row-active"><td class="label-l2 col-title">Nông nghiệp</td><td class="text-left col-unit">Tỷ VNĐ</td><td class="text-right" value="220863">220,863</td><td class="text-right" value="349207">349,207</td><td class="text-right" value="224182">224,182</td><td class="text-right" value="258553">258,553</td><td class="text-right" value="282757">282,757</td><td class="text-right" value="274540">274,540</td><td class="text-right" value="233213">233,213</td><td class="text-right" value="256159">256,159</td><td class="text-right" value="270101">270,101</td><td class="text-right" value="345510">345,510</td><td class="text-right" value="268224">268,224</td><td class="text-right" value="268127">268,127</td><td class="text-right" value="298813">298,813</td><td class="text-right" value="361551">361,551</td><td class="text-right" value="295777">295,777</td><td class="text-right" value="308208">308,208</td><td class="text-right" value="339433">339,433</td><td class="text-right" value="415226">415,226</td><td class="text-right" value="324685">324,685</td><td class="text-right" value="343198">343,198</td></tr><tr class="row-active"><td class="label-l2 col-title">Công nghiệp</td><td class="text-left col-unit">Tỷ VNĐ</td><td class="text-right" value="519397">519,397</td><td class="text-right" value="738351">738,351</td><td class="text-right" value="698219">698,219</td><td class="text-right" value="787580">787,580</td><td class="text-right" value="770816">770,816</td><td class="text-right" value="918865">918,865</td><td class="text-right" value="809861">809,861</td><td class="text-right" value="926735">926,735</td><td class="text-right" value="948921">948,921</td><td class="text-right" value="1008490">1,008,490</td><td class="text-right" value="816185">816,185</td><td class="text-right" value="920250">920,250</td><td class="text-right" value="968434">968,434</td><td class="text-right" value="1094325">1,094,325</td><td class="text-right" value="897978">897,978</td><td class="text-right" value="1010232">1,010,232</td><td class="text-right" value="1119474">1,119,474</td><td class="text-right" value="1245248">1,245,248</td><td class="text-right" value="1020031">1,020,031</td><td class="text-right" value="1159324">1,159,324</td></tr><tr class=""><td class="label-l2 col-title">Dịch vụ</td><td class="text-left col-unit">Tỷ VNĐ</td><td class="text-right" value="699839">699,839</td><td class="text-right" value="836983">836,983</td><td class="text-right" value="808319">808,319</td><td class="text-right" value="823138">823,138</td><td class="text-right" value="759537">759,537</td><td class="text-right" value="1006580">1,006,580</td><td class="text-right" value="889376">889,376</td><td class="text-right" value="909571">909,571</td><td class="text-right" value="956208">956,208</td><td class="text-right" value="1102360">1,102,360</td><td class="text-right" value="1004341">1,004,341</td><td class="text-right" value="1049810">1,049,810</td><td class="text-right" value="1065001">1,065,001</td><td class="text-right" value="1237147">1,237,147</td><td class="text-right" value="1092719">1,092,719</td><td class="text-right" value="1182165">1,182,165</td><td class="text-right" value="1203831">1,203,831</td><td class="text-right" value="1386287">1,386,287</td><td class="text-right" value="1220270">1,220,270</td><td class="text-right" value="1339188">1,339,188</td></tr><tr class="group"><td colspan="100000" class="label-l1"><div>Cơ cấu GDP theo giá hiện tại</div></td></tr><tr class=""><td class="label-l2 col-title">Nông nghiệp</td><td class="text-left col-unit">%</td><td class="text-right" value="13.86">13.86</td><td class="text-right" value="16.46">16.46</td><td class="text-right" value="11.71">11.71</td><td class="text-right" value="12.61">12.61</td><td class="text-right" value="14.23">14.23</td><td class="text-right" value="11.44">11.44</td><td class="text-right" value="10.94">10.94</td><td class="text-right" value="11.18">11.18</td><td class="text-right" value="11.38">11.38</td><td class="text-right" value="12.95">12.95</td><td class="text-right" value="11.66">11.66</td><td class="text-right" value="10.97">10.97</td><td class="text-right" value="11.76">11.76</td><td class="text-right" value="12.38">12.38</td><td class="text-right" value="11.77">11.77</td><td class="text-right" value="11.3">11.3</td><td class="text-right" value="11.72">11.72</td><td class="text-right" value="12.59">12.59</td><td class="text-right" value="11.56">11.56</td><td class="text-right" value="11.1">11.1</td></tr><tr class=""><td class="label-l2 col-title">Công nghiệp</td><td class="text-left col-unit">%</td><td class="text-right" value="32.59">32.59</td><td class="text-right" value="34.81">34.81</td><td class="text-right" value="36.45">36.45</td><td class="text-right" value="38.41">38.41</td><td class="text-right" value="38.79">38.79</td><td class="text-right" value="38.3">38.3</td><td class="text-right" value="37.97">37.97</td><td class="text-right" value="40.43">40.43</td><td class="text-right" value="39.99">39.99</td><td class="text-right" value="37.78">37.78</td><td class="text-right" value="35.47">35.47</td><td class="text-right" value="37.64">37.64</td><td class="text-right" value="38.12">38.12</td><td class="text-right" value="37.46">37.46</td><td class="text-right" value="35.73">35.73</td><td class="text-right" value="37.04">37.04</td><td class="text-right" value="38.67">38.67</td><td class="text-right" value="37.76">37.76</td><td class="text-right" value="36.31">36.31</td><td class="text-right" value="37.51">37.51</td></tr><tr class=""><td class="label-l2 col-title">Dịch vụ</td><td class="text-left col-unit">%</td><td class="text-right" value="43.92">43.92</td><td class="text-right" value="39.45">39.45</td><td class="text-right" value="42.2">42.2</td><td class="text-right" value="40.14">40.14</td><td class="text-right" value="38.23">38.23</td><td class="text-right" value="41.96">41.96</td><td class="text-right" value="41.7">41.7</td><td class="text-right" value="39.68">39.68</td><td class="text-right" value="40.29">40.29</td><td class="text-right" value="41.3">41.3</td><td class="text-right" value="43.65">43.65</td><td class="text-right" value="42.94">42.94</td><td class="text-right" value="41.92">41.92</td><td class="text-right" value="42.35">42.35</td><td class="text-right" value="43.48">43.48</td><td class="text-right" value="43.34">43.34</td><td class="text-right" value="41.58">41.58</td><td class="text-right" value="42.04">42.04</td><td class="text-right" value="43.44">43.44</td><td class="text-right" value="43.32">43.32</td></tr></tbody></table>
  `;

    htmlInput.value = sampleData.trim();
});