import prisma from './utils/prisma';
import bcrypt from 'bcrypt';

async function seedLeaders() {
  console.log('⚡ Đang xóa dữ liệu cũ để reset tài khoản và đề tài...');
  await prisma.task.deleteMany({});
  await prisma.researchContent.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('⚡ Đang khởi tạo danh sách tài khoản theo yêu cầu (Mật khẩu: vigh2026)...');

  const hashedPassword = await bcrypt.hash('vigh2026', 10);

  const accounts = [
    // Lãnh đạo & SuperAdmin
    {
      email: 'superadmin@vigh.vn',
      name: 'Nguyễn Mạnh Sơn',
      role: 'SuperAdmin',
      department: 'Phòng Tin học - Đẹp trai',
      phone: '',
    },
    {
      email: 'vientruong@vigh.vn',
      name: 'TS. Phạm Hà Thanh Tùng',
      role: 'VienTruong',
      department: 'Ban Lãnh Đạo Viện VIGH',
      phone: '',
    },
    {
      email: 'vienpho@vigh.vn',
      name: 'TS. Võ Thuỵ Lữ Tâm',
      role: 'VienPho',
      department: 'Ban Lãnh Đạo Viện VIGH',
      phone: '',
    },
    // Trưởng Phòng
    {
      email: 'haubth@vigh.vn',
      name: 'Bùi Thị Hồng Hậu',
      role: 'TruongPhong',
      department: 'Phòng Công nghệ Dược',
      phone: '',
    },
    {
      email: 'diemlt@vigh.vn',
      name: 'Diễm Lê Thị',
      role: 'TruongPhong',
      department: 'Phòng Công nghệ Dược',
      phone: '',
    },
    // Chuyên viên
    {
      email: 'tranglt@vigh.vn',
      name: 'Lê Thùy Trang',
      role: 'ChuyenVien',
      department: 'Phòng Công nghệ Dược',
      phone: '',
    },
    {
      email: 'anhhn@vigh.vn',
      name: 'Hoàng Ngọc Anh',
      role: 'ChuyenVien',
      department: 'Phòng Công nghệ Dược',
      phone: '',
    },
    {
      email: 'nganmk@vigh.vn',
      name: 'Mai Kim Ngân',
      role: 'ChuyenVien',
      department: 'Phòng Sinh học',
      phone: '',
    },
    {
      email: 'binhhv@vigh.vn',
      name: 'Bình Hoàng Văn',
      role: 'ChuyenVien',
      department: 'Phòng Sinh học',
      phone: '',
    },
    {
      email: 'chilu@vigh.vn',
      name: 'Lê Uyên Chi',
      role: 'ChuyenVien',
      department: 'Phòng Tin học',
      phone: '',
    },
  ];

  const userMap: { [email: string]: any } = {};

  for (const acc of accounts) {
    const user = await prisma.user.create({
      data: {
        email: acc.email,
        name: acc.name,
        role: acc.role,
        passwordHash: hashedPassword,
        department: acc.department,
        phone: acc.phone,
      },
    });
    userMap[acc.email.toLowerCase()] = user;
    console.log(`✅ Đã tạo tài khoản: [${user.role}] - ${user.email}`);
  }

  // Khởi tạo đề tài mẫu với Chủ nhiệm là Viện Trưởng
  console.log('⚡ Đang tạo đề tài thử nghiệm theo yêu cầu...');
  const managerUser = userMap['vientruong@vigh.vn'];

  const memberEmails = [
    'vienpho@vigh.vn',
    'nganmk@vigh.vn',
    'binhhv@vigh.vn',
    'chilu@vigh.vn'
  ];
  const memberUsers = memberEmails.map(e => userMap[e]).filter(Boolean);

  const project = await prisma.project.create({
    data: {
      id: 1,
      name: 'Sàng lọc cây thuốc điều trị sa sút trí tuệ của dân tộc Dao ở Việt Nam và nghiên cứu thành phần hóa học, tác dụng cải thiện trí nhớ của một số dược liệu điển hình',
      nameEn: 'Ethno-herbal medicine screening for dementia treatment among the Dao ethnic group in Vietnam and evaluation of chemical composition, memory-enhancing effects of selected promising plants',
      code: '108.05-2023.20',
      projectType: 'Nghiên cứu cơ bản trong KHTN & KT (NAFOSTED)',
      managementUnit: 'Quỹ Phát triển KH&CN Quốc gia (NAFOSTED) — Bộ Khoa học & Công nghệ',
      hostOrganization: 'Trường Đại học Phenikaa',
      advisor: 'PGS.TS. Trần Văn Ơn (cố vấn dân tộc học)',
      executionTime: '36 tháng · 08/2024 – 08/2027',
      budget: '1.037.000.000 đồng (737.000.000 đ (khoán từng phần) + 300.000.000 đ (không khoán))',
      generalObjective: 'Sàng lọc cây thuốc người Dao điều trị sa sút trí tuệ; nghiên cứu thành phần hóa học và tác dụng cải thiện trí nhớ của một số dược liệu điển hình.',
      status: 'IN_PROGRESS',
      managerId: managerUser.id,
      members: {
        connect: memberUsers.map(u => ({ id: u.id }))
      }
    }
  });

  // Tạo các Thẻ nội dung & Hoạt động
  await prisma.researchContent.createMany({
    data: [
      {
        projectId: 1,
        code: 'ND1',
        title: 'Điều tra dân tộc học cây thuốc SSTT của người Dao',
        status: 'Đang thực hiện',
        description: 'Thu thập tri thức bản địa người Dao (Ba Vì, Sa Pa, Quản Bạ) về cây thuốc trị SSTT; giám định, lưu tiêu bản, lập ngân hàng dược liệu + CSDL.',
        activities: JSON.stringify([
          { id: 'ND1.1', activity: 'Điều tra thực địa 3 xã (Ba Vì, Sa Pa, Nậm Đãm)', result: 'Bộ công cụ + dữ liệu khảo sát 3 xã (SP 1.1–1.2)' },
          { id: 'ND1.2', activity: 'Giám định tên khoa học, lưu tiêu bản', result: 'Danh mục tên KH + bộ tiêu bản (BC 1.3)' },
          { id: 'ND1.3', activity: 'Ngân hàng dược liệu khô + cao chiết + CSDL', result: 'Ngân hàng mẫu + CSDL quản lý (SP 1.4)' }
        ])
      },
      {
        projectId: 1,
        code: 'ND2',
        title: 'Sàng lọc ức chế acetylcholinesterase (AChE) in vitro',
        status: 'Đang thực hiện',
        description: 'Sàng lọc khả năng ức chế AChE của dịch chiết và đánh giá bảo vệ tế bào.',
        activities: JSON.stringify([
          { id: 'ND2.1', activity: 'Thử ức chế AChE in vitro (Ellman) + bảo vệ tế bào', result: 'Báo cáo % ức chế AChE + bảo vệ tế bào (chuyên đề 2.1)' }
        ])
      },
      {
        projectId: 1,
        code: 'ND3',
        title: 'Bộ tiêu chí -> chọn 03 cây thuốc tiềm năng',
        status: 'Đang thực hiện',
        description: 'Xây dựng bộ tiêu chí và đánh giá lựa chọn ra 03 cây thuốc tiềm năng nhất để tiếp tục nghiên cứu sâu.',
        activities: JSON.stringify([
          { id: 'ND3.1', activity: 'Xây dựng tiêu chí đánh giá & chấm điểm lựa chọn', result: 'Danh sách 03 cây thuốc tiềm năng được chọn (SP 3.1)' }
        ])
      }
    ]
  });

  // Phân công công việc mẫu cho từng thành viên
  console.log('⚡ Đang tạo các công việc phân công mẫu cho từng thành viên...');
  const userNgan = userMap['nganmk@vigh.vn'];
  const userBinh = userMap['binhhv@vigh.vn'];
  const userChi = userMap['chilu@vigh.vn'];
  const userVienPho = userMap['vienpho@vigh.vn'];

  if (userNgan) {
    await prisma.task.create({
      data: {
        title: '[ND1.1] Điều tra thực địa 3 xã (Ba Vì, Sa Pa, Nậm Đãm)',
        projectId: 1,
        assigneeId: userNgan.id,
        status: 'IN_PROGRESS',
        progress: 40,
        description: JSON.stringify({
          activityCode: 'ND1.1',
          expectedResult: 'Bộ công cụ + dữ liệu khảo sát 3 xã (SP 1.1–1.2)',
          deadline: '2026-08-15',
          assignDate: '01/07/2026'
        })
      }
    });
  }

  if (userBinh) {
    await prisma.task.create({
      data: {
        title: '[ND1.2] Giám định tên khoa học, lưu tiêu bản',
        projectId: 1,
        assigneeId: userBinh.id,
        status: 'IN_PROGRESS',
        progress: 20,
        description: JSON.stringify({
          activityCode: 'ND1.2',
          expectedResult: 'Danh mục tên KH + bộ tiêu bản (BC 1.3)',
          deadline: '2026-09-30',
          assignDate: '01/07/2026'
        })
      }
    });
  }

  if (userChi) {
    await prisma.task.create({
      data: {
        title: '[ND2.1] Thử ức chế AChE in vitro (Ellman) + bảo vệ tế bào',
        projectId: 1,
        assigneeId: userChi.id,
        status: 'TODO',
        progress: 0,
        description: JSON.stringify({
          activityCode: 'ND2.1',
          expectedResult: 'Báo cáo % ức chế AChE + bảo vệ tế bào (chuyên đề 2.1)',
          deadline: '2026-10-15',
          assignDate: '02/07/2026'
        })
      }
    });
  }

  if (userVienPho) {
    await prisma.task.create({
      data: {
        title: '[ND3.1] Xây dựng tiêu chí đánh giá & chấm điểm lựa chọn',
        projectId: 1,
        assigneeId: userVienPho.id,
        status: 'IN_PROGRESS',
        progress: 30,
        description: JSON.stringify({
          activityCode: 'ND3.1',
          expectedResult: 'Danh sách 03 cây thuốc tiềm năng được chọn (SP 3.1)',
          deadline: '2026-07-30',
          assignDate: '15/06/2026'
        })
      }
    });
  }

  console.log('🎉 Hoàn tất seed dữ liệu! Tất cả mật khẩu mặc định là: vigh2026');
}

seedLeaders()
  .catch((e) => {
    console.error('❌ Lỗi tạo dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
